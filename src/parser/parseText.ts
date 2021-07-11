import { Lexer, TOKEN_CLOSE, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_RIGHT_PAREN, TOKEN_SELF_CLOSE, TOKEN_TAG_NAME } from "../lexer";


export interface Node {
    LineNum?: number,
    children?: Array<any>,
    content: string,
    type?: string,
    selfClose?: boolean
}

export class Node {
    constructor() {
        this.children = []
        this.content = ""
    }
}

export function isClose(lexer: Lexer) {
    if (lexer.stack.length < 4) return false
    // </a>
    let one = lexer.stack[lexer.stack.length - 2].tokenType === TOKEN_RIGHT_PAREN /*>*/ &&
        lexer.stack[lexer.stack.length - 3].tokenType === TOKEN_NAME /*tag_name*/ &&
        lexer.stack[lexer.stack.length - 4].tokenType === TOKEN_CLOSE /*</*/;
    // <a>
    let close = lexer.stack[lexer.stack.length - 2].tokenType === TOKEN_RIGHT_PAREN /*>*/ &&
        lexer.stack[lexer.stack.length - 3].tokenType === TOKEN_NAME /*tag_name*/ &&
        lexer.stack[lexer.stack.length - 4].tokenType === TOKEN_LEFT_PAREN /*<*/;
    // />
    let selfClose = lexer.stack[lexer.stack.length - 2].tokenType === TOKEN_SELF_CLOSE; // /> <br />
    return one || close || selfClose;
}

function contentEnd(lexer: Lexer) {
    if (isClose(lexer) && lexer.stack[lexer.stack.length - 3].token === "script") {
        let script = "</script>"
        if (lexer.sourceCode.slice(0, script.length) === script) {
            return false
        } else {
            return true
        }
    } else {
        if (lexer.sourceCode.slice(0, 2) === "</" || (isClose(lexer) && lexer.sourceCode[0] === "<" && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
            return false;
        } else {
            return true;
        }
    }
}
export function parseText(lexer: Lexer) {
    lexer.hasCache = false
    let node = new Node()
    let content = ""
    while (contentEnd(lexer)) {
        content += lexer.sourceCode[0]
        lexer.skipSourceCode(1)
    }
    lexer.isIgnored();
    node.content = content
    node.LineNum = lexer.GetLineNum()
    node.type = "text"
    return node
}
