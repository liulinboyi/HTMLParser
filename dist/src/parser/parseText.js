"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseText = exports.isClose = exports.Node = void 0;
const lexer_1 = require("../lexer");
class Node {
    constructor() {
        this.children = [];
        this.content = "";
    }
}
exports.Node = Node;
function isClose(lexer) {
    if (lexer.stack.length < 4)
        return false;
    // </a>
    let one = lexer.stack[lexer.stack.length - 2].tokenType === lexer_1.TOKEN_RIGHT_PAREN /*>*/ &&
        lexer.stack[lexer.stack.length - 3].tokenType === lexer_1.TOKEN_NAME /*tag_name*/ &&
        lexer.stack[lexer.stack.length - 4].tokenType === lexer_1.TOKEN_CLOSE /*</*/;
    // <a>
    let close = lexer.stack[lexer.stack.length - 2].tokenType === lexer_1.TOKEN_RIGHT_PAREN /*>*/ &&
        lexer.stack[lexer.stack.length - 3].tokenType === lexer_1.TOKEN_NAME /*tag_name*/ &&
        lexer.stack[lexer.stack.length - 4].tokenType === lexer_1.TOKEN_LEFT_PAREN /*<*/;
    // />
    let selfClose = lexer.stack[lexer.stack.length - 2].tokenType === lexer_1.TOKEN_SELF_CLOSE; // /> <br />
    return one || close || selfClose;
}
exports.isClose = isClose;
function contentEnd(lexer) {
    if (isClose(lexer) && lexer.stack[lexer.stack.length - 3].token === "script") {
        let script = "</script>";
        if (lexer.sourceCode.slice(0, script.length) === script) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        if (lexer.sourceCode.slice(0, 2) === "</" || (isClose(lexer) && lexer.sourceCode[0] === "<" && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
            return false;
        }
        else {
            return true;
        }
    }
}
function parseText(lexer) {
    lexer.hasCache = false;
    let node = new Node();
    let content = "";
    while (contentEnd(lexer)) {
        content += lexer.sourceCode[0];
        lexer.skipSourceCode(1);
    }
    lexer.isIgnored();
    node.content = content;
    node.LineNum = lexer.GetLineNum();
    node.type = "text";
    return node;
}
exports.parseText = parseText;
