import { COMMENT, Lexer, NewLexer, tokenNameMap, TOKEN_CLOSE, TOKEN_CONTENT_TEXT, TOKEN_DTD, TOKEN_DUOQUOTE, TOKEN_EOF, TOKEN_IGNORED, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_QUOTE } from "./lexer"
import { parseHtml } from "./parser/Html"
import { isClose, parseText } from "./parser/parseText"
import { isSpecialTag, parseClose } from "./parser/tagClose"
import { parseDtd } from "./parser/DTD"
import { paseComment } from "./parser/Comment"

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

// Statement
function parseStatements(lexer: Lexer) {

    let root = {
        type: "root",
        children: [],
        LineNum: 1
    }

    let statements: Array<any> = [root]

    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement: any = {}
        statement = parseStatement(lexer)
        if (!statement) continue
        let stack = statements;
        let s = statement;
        if (!s.closeTag) {
            stack[stack.length - 1].children.push(s) // 栈顶就是levalElement层级元素
            if (s.type === "tag" && !s.selfClose && !isSpecialTag(s)) {
                stack.push(s)
            }
        } else {
            if (stack[stack.length - 1].tag !== s.tag) {
                stack[stack.length - 1].children.push(s)
                // 学习浏览器HTML解析，即使匹配不上也不报错，直接添加到levalElement层级元素当child
                console.error(`${stack[stack.length - 1].tag} and ${s.tag} is not math! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`)
                // throw new Error(`${stack[stack.length - 1].tag} and ${s.tag} is not math! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`)
            } else {
                stack.pop()
            }
        }
    }
    return root
}

function parseStatement(lexer: Lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(TOKEN_IGNORED) // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType
    let flag = false
    let top = lexer.stack[lexer.stack.length - 1]
    if (isClose(lexer) &&
        top.tokenType !== TOKEN_LEFT_PAREN &&
        top.tokenType !== TOKEN_CLOSE &&
        top.tokenType !== TOKEN_DTD &&
        top.tokenType !== COMMENT
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
