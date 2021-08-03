import { COMMENT, DIRECTIVE, Lexer, NewLexer, TOKEN_CLOSE, TOKEN_CONTENT_TEXT, TOKEN_DTD, TOKEN_EOF, TOKEN_IGNORED, TOKEN_LEFT_PAREN } from "./lexer"
import { paseComment } from "./parser/Comment"
import { paseDirective } from "./parser/Directive"
import { parseDtd } from "./parser/DTD"
import { parseHtml } from "./parser/Html"
import { parseText } from "./parser/parseText"
import { isSpecialTag, parseClose } from "./parser/tagClose"

export interface Program {
    type?: string,
    LineNum?: number,
    children: Array<any>,
}

export class Program {
    constructor() {
        this.type = 'root'
        this.children = []
    }
}


// SourceCode ::= Statement+ 
function parseSourceCode(lexer: Lexer) {
    let LineNum = lexer.GetLineNum()
    let root = parseStatements(lexer)
    root.LineNum = LineNum
    return root
}

/**
 * 将children中的多余的text节点去除
 * @param children 
 * @returns 
 */
function filterText(children: any) {
    for (let start = 0; start < children.length; start++) {
        if (children[start].type === "text") {
            // 从实践中知道，如果有去除body后多余的text节点，则最多是两个取一个，所以有下面代码
            let i = start + 1
            if (i < children.length && children[i].type === "text") {
                // 其中重要的特征就是，里面是只有\r\n和空格
                // 只要当前标签和下一个标签这两个标签，则一定会删除一个"空标签(只包含\r\n和空格)"
                if (!children[i].content.replace(/[\r\n]+/g, "").trim()) {
                    children[i].delete = true // 添加上delete属性，后面好处理
                } else {
                    children[start].delete = true // 添加上delete属性，后面好处理
                }
            }
        }
    }
    // 删除delete为true的标签
    return children.filter((item: any) => !item.delete)
}

// Statement
function parseStatements(lexer: Lexer) {

    let root: any = {
        type: "root",
        children: [],
        LineNum: 1
    }

    let statements: Array<any> = [root]

    let Block_level_elements = [ // 块级元素
        "address",
        "article",
        "aside",
        "audio",
        "blockquote",
        "canvas",
        "dd",
        "div",
        "dl",
        "fieldset",
        "figcaption",
        "figure",
        "figcaption",
        "footer",
        "form",
        "header",
        "hgroup",
        "hr",
        "noscript",
        "ol",
        "output",
        "p",
        "pre",
        "section",
        "table",
        "tfoot",
        "ul",
        "video"
    ]

    let inlInline_elementsine = [ // 行内元素
        "b",
        "big",
        "i",
        "small",
        "tt",
        "abbr",
        "acronym",
        "cite",
        "code",
        "dfn",
        "em",
        "kbd",
        "strong",
        "samp",
        "var",
        "a",
        "bdo",
        "br",
        "img",
        "map",
        "object",
        "q",
        "script",
        "span",
        "sub",
        "sup",
        "button",
        "input",
        "label",
        "select",
        "textarea"
    ]

    let notInSelf = [ // 不能包含自己的元素
        "a",
        "br",
        "img",
        "script",
        "button",
        "input",
    ]
    // select <select><select></select></select> 里面的select会消失
    // textarea <textarea><textarea></textarea></textarea> 会解析成 <textarea><textarea></textarea>


    let body: any = null
    let mainBodyFinished = false
    // let mainBodyFinishedIsText = false
    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement: any = {}
        statement = parseStatement(lexer)
        // console.log(`at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 30)}`)
        if (!statement) continue
        let stack = statements;
        let s = statement;
        const length = stack.length - 1
        if (s.type === "tag") {
            s.tag = s.tag.toLocaleLowerCase()
        }
        if (!s.closeTag) {

            if (notInSelf.includes(s.tag) && s.tag === stack[length].tag) { // 不能包含自己的元素
                stack.pop()
                stack[stack.length - 1].children.push(s)
                stack.push(s)
                continue
            }

            // 处理多个body标签的问题
            // 如果mainBodyFinished位false，表示还未出现第一个body，并且当前起始标签是body，则寻找他的父节点，并将其赋值给body变量
            if (!mainBodyFinished && s.tag === "body" && !body) {
                // 寻找父节点
                let i = stack.length - 1
                let parent = null
                while (stack[i].type !== "tag" && i >= 0) {
                    i--;
                }
                parent = i >= 0 ? stack[i] : null;
                // 找到的节点，赋值给body
                body = s
                // 找到的父节点赋值给上面节点的parent属性，方便后续处理
                body.parent = parent
            }

            stack[length].children.push(s) // 栈顶就是levalElement层级元素
            if (s.type === "tag" && !s.selfClose && !isSpecialTag(s)) {
                stack.push(s)
                // 处理多个body标签的问题
                // 如果已经出现过一个body标签并且现在这个起始标签还是body，则将其从栈中弹出，并且将其从栈顶的children中弹出
                if (mainBodyFinished && s.tag === "body") {
                    stack.pop()
                    stack[length].children.pop()
                }
            }
            // 处理多个body标签的问题
            // 如果出现第一个body起始标签，则将mainBodyFinished置为true，方便在第一个body标签中再次出现body起始标签时将其忽略
            if (!mainBodyFinished && s.tag === "body") {
                mainBodyFinished = true
            }
        } else {
            if (stack[length].tag !== s.tag) {
                // 处理多个body标签的问题
                // 如果当前第一个body标签解析完成（mainBodyFinished），并且当前结束标签是body，则直接进行下次循环
                if (mainBodyFinished && s.tag === "body") {
                    continue
                }
                if (Block_level_elements.includes(s.tag)) { // 入过是块级元素会加入到levalElement层级元素当child
                    stack[length].children.push(s)
                }
                // 学习浏览器HTML解析，即使匹配不上也不报错，直接添加到levalElement层级元素当child
                console.warn(`${stack[length].tag} and ${s.tag} is not math! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`)
                // throw new Error(`${stack[length].tag} and ${s.tag} is not math! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`)
            } else {
                // 处理多个body标签的问题
                // 如果第一个body标签没有解析完成（mainBodyFinished），并且当前结束标签是body，则mainBodyFinished置为true
                if (!mainBodyFinished && s.tag === "body") {
                    mainBodyFinished = true
                }
                stack.pop()
            }
        }
    }

    // 处理多个body标签的问题
    // 找出body在父节点的索引
    let index = body && body.parent.children.findIndex((item: any) => item === body)
    // 从父节点下一个索引开始添加到第一个body中
    let real = index + 1

    if (body) {

        for (let i = real; i < body.parent.children.length; i++) {
            if (body.parent.children[i].type === "tag") {
                body.parent.children[i].children = filterText(body.parent.children[i].children)
            }
            body.children.push(body.parent.children[i])
        }

        let childrenLength = body.parent.children.length
        for (let i = real; i < childrenLength; i++) {
            body.parent.children.pop()
        }

        body.children = filterText(body.children)

        body.parent = null
    }


    for (let i = 0; i < root.children.length; i++) {
        if (root.children[i].type === "DTD") {
            if (i - 1 >= 0 && root.children[i - 1].type === "text" && !root.children[i - 1].content.replace(/[\r\n]+/g, "").trim()) {
                root.children[i - 1].delete = true
            }
        }
        if (root.children[i].tag === "html") {
            if (i - 1 >= 0 && root.children[i - 1].type === "text" && !root.children[i - 1].content.replace(/[\r\n]+/g, "").trim()) {
                root.children[i - 1].delete = true
            }
        }
    }

    root.children = root.children.filter((item: any) => !item.delete)

    return root
}

function parseStatement(lexer: Lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType
    let flag = false
    let top = lexer.stack[lexer.stack.length - 1]
    if (
        top.tokenType === TOKEN_CONTENT_TEXT
        // isClose(lexer) &&
        // top.tokenType !== TOKEN_LEFT_PAREN /*<*/ &&
        // top.tokenType !== TOKEN_CLOSE /*</*/ &&
        // top.tokenType !== TOKEN_DTD /*DTD*/ &&
        // top.tokenType !== COMMENT /*COMMENT*/
    ) {
        flag = true
    } else {
        flag = false
    }

    if (flag) {
        return parseText(lexer)
    } else {
        switch (look) {
            case TOKEN_LEFT_PAREN: // <
                return parseHtml(lexer)
            case TOKEN_CLOSE: // </
                return parseClose(lexer)
            case TOKEN_DTD: // dtd
                return parseDtd(lexer)
            case COMMENT:
                return paseComment(lexer)
            case DIRECTIVE:
                return paseDirective(lexer)
            default:
                throw new Error(`parseStatement(): unknown Statement. at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 50)}`)
        }
    }


}

function isSourceCodeEnd(token: number): boolean {
    return token === TOKEN_EOF
}

export function parse(code: string) {

    let lexer = NewLexer(code)
    let sourceCode = parseSourceCode(lexer);

    lexer.NextTokenIs(TOKEN_EOF)
    return sourceCode
}
