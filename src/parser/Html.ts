import { Lexer, TOKEN_EQUAL, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_QUOTE, TOKEN_RIGHT_PAREN, TOKEN_SELF_CLOSE, TOKEN_SINGLE_QUOTE } from "../lexer";

export interface Node {
    LineNum?: number,
    children?: Array<any>,
    attr: Array<any>,
    type?: string,
    tag?: string,
    selfClose?: boolean
}

export class Node {
    constructor() {
        this.children = []
        this.attr = []
    }
}

export function parseTag(lexer: Lexer) {
    return lexer.NextTokenIs(TOKEN_NAME).nowToken; // tag_name
}

export function parseName(lexer: Lexer, node: any) {
    let attrReg = /[^\s"'>/=[\u0000-\u001f]+/.exec(lexer.sourceCode)
    let name = ""
    if (attrReg) {
        name = attrReg[0]
    }
    if (name.includes("<")) {
        /*
        <a name="xiaoming"
            <p class="cf">

            </p>
        
        暂时当做selfClose标签处理
        */
        node.selfClose = true
    }
    lexer.skipSourceCode(name.length)
    return name
}

function genereteAttr(name: any, value?: any) {
    return {
        name,
        value,
    }
}

export function parseValue(lexer: Lexer) {
    if (lexer.sourceCode[0] === "'") {
        return parseSingleQuotedAttr(lexer)
    } else if (lexer.sourceCode[0] === '"') {
        return parseDoubleQuotedAttr(lexer)
    } else {
        return parseString(lexer)
    }
}

export function parseString(lexer: Lexer) {
    let value = ""
    // lexer.NextTokenIs(TOKEN_SINGLE_QUOTE);
    // lexer.stack.pop()
    let res = /[^\s><]*/.exec(lexer.sourceCode)
    if (res) {
        value = res[0]
    }
    lexer.skipSourceCode(value.length)
    // lexer.NextTokenIs(TOKEN_SINGLE_QUOTE);
    // lexer.stack.pop()
    return value
}

export function parseSingleQuotedAttr(lexer: Lexer) {
    let value = ""
    lexer.NextTokenIs(TOKEN_SINGLE_QUOTE);
    lexer.stack.pop()
    let res = /[^']*/.exec(lexer.sourceCode)
    if (res) {
        value = res[0]
    }
    lexer.skipSourceCode(value.length)
    lexer.NextTokenIs(TOKEN_SINGLE_QUOTE);
    lexer.stack.pop()
    return value
}

export function parseDoubleQuotedAttr(lexer: Lexer) {
    let value = ""
    lexer.NextTokenIs(TOKEN_QUOTE);
    lexer.stack.pop()
    let res = /[^"]*/.exec(lexer.sourceCode)
    if (res) {
        value = res[0]
    }
    lexer.skipSourceCode(value.length)
    lexer.NextTokenIs(TOKEN_QUOTE);
    lexer.stack.pop()
    return value
}

export function parseAttr(lexer: Lexer, node: any) {
    let attrItem: {
        name?: string,
        value?: string,
    } = {}
    lexer.isIgnored(); // 空格
    let tag = parseName(lexer, node)
    lexer.isIgnored() // 空格
    if (tag) {
        let attr = tag
        attrItem = genereteAttr(attr); // name
        lexer.isIgnored(); // 空格
        if (lexer.sourceCode[0] === "=") {
            lexer.NextTokenIs(TOKEN_EQUAL) // =
            lexer.stack.pop()
            lexer.isIgnored(); // 空格 
            attrItem.value = parseValue(lexer)
            lexer.isIgnored(); // 空格 
        } else {
            attrItem.value = "true"
            lexer.isIgnored(); // 空格 
        }
    }
    return attrItem
}

function checkAttrEnd(lexer: Lexer, node: Node) {
    if (lexer.sourceCode[0] === ">") {
        lexer.skipSourceCode(1)
        lexer.stack.push({ lineNum: lexer.lineNum, tokenType: TOKEN_RIGHT_PAREN /*>*/, token: ">" })
        return false
    } else if (lexer.sourceCode.slice(0, 2) === "/>") {
        node.selfClose = true
        lexer.skipSourceCode(2);
        lexer.stack.push({ lineNum: lexer.lineNum, tokenType: TOKEN_SELF_CLOSE /*/> <br />*/, token: "/>" })
        return false
    } else {
        return true
    }
}

export function parseHtml(lexer: Lexer) {
    let node = new Node()

    node.LineNum = lexer.GetLineNum()
    lexer.NextTokenIs(TOKEN_LEFT_PAREN) // <
    node.type = "tag"
    node.tag = parseTag(lexer)
    lexer.isIgnored()
    while (checkAttrEnd(lexer, node)) {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1
            lexer.skipSourceCode(2)
        } else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1
                lexer.skipSourceCode(1)
            }
        }
        let res = parseAttr(lexer, node)
        node.attr.push(res)
    }
    // lexer.isIgnored()
    return node
}