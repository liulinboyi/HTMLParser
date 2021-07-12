"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseText = exports.isClose = exports.Node = void 0;
const lexer_1 = require("../lexer");
const Html_1 = require("./Html");
class Node {
    constructor() {
        this.content = "";
    }
}
exports.Node = Node;
function isClose(lexer) {
    if (lexer.stack.length >= 2 &&
        (lexer.stack[lexer.stack.length - 2].tokenType === lexer_1.TOKEN_DTD /*dtd*/ ||
            lexer.stack[lexer.stack.length - 2].tokenType === lexer_1.COMMENT /*comment*/)) {
        return true;
    }
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
    // if (isClose(lexer) && lexer.stack.length >= 3 && lexer.stack[lexer.stack.length - 3].token === "script") {
    //     let script = "</script>"
    //     if (lexer.sourceCode.slice(0, script.length) === script) {
    //         return false
    //     } else {
    //         return true
    //     }
    // } else {
    //     if (lexer.sourceCode.slice(0, 2) === "</" ||
    //         (isClose(lexer) && lexer.sourceCode[0] === "<"
    //             && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) ||
    //         lexer.sourceCode.slice(0, 4) === "<!--"
    //     ) {
    //         return false;
    //     } else {
    //         return true;
    //     }
    // }
    // <div>contentText</div>
    // <div>contentText<div>
    // <meta>contentText<!---->
    // <div>contentText<br /> || <div>contentText<br 属性    />
    let stack = lexer.stack;
    if (isClose(lexer) &&
        stack.length >= 4 &&
        stack[stack.length - 2].tokenType === lexer_1.TOKEN_RIGHT_PAREN /*>*/ &&
        stack[stack.length - 3].tokenType === lexer_1.TOKEN_NAME /*name*/ &&
        stack[stack.length - 4].tokenType === lexer_1.TOKEN_LEFT_PAREN /*<*/) {
        if (lexer.stack[lexer.stack.length - 3].token === "script") {
            /*
            <script>
                '<script src="https://"><\/script>'
            </script>
            */
            let script = "</script>";
            if (lexer.sourceCode.slice(0, script.length) === script) {
                return false;
            }
            else {
                return true;
            }
        }
        if (lexer.sourceCode.slice(0, 2) === "</" /*<div>contentText</div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<meta>contentText<!---->*/ ||
            (lexer.sourceCode[0] === "<" &&
                /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<div>contentText<div>*/) {
            return false;
        }
        else {
            /*<div>contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = Html_1.parseHtml(lexer);
                if (parseRes.selfClose) {
                    return false;
                }
            }
            return true;
        }
    }
    // </div>contentText<div>
    // </div>contentText<!---->
    // </div>contentText</div>
    // </div>contentText<br />
    if (isClose(lexer) &&
        stack.length >= 4 &&
        stack[stack.length - 2].tokenType === lexer_1.TOKEN_RIGHT_PAREN /*>*/ &&
        stack[stack.length - 3].tokenType === lexer_1.TOKEN_NAME /*name*/ &&
        stack[stack.length - 4].tokenType === lexer_1.TOKEN_CLOSE /*</*/) {
        if ((lexer.sourceCode[0] === "<" &&
            /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*</div>contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*</div>contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*</div>contentText</div>*/) {
            return false;
        }
        else {
            /*</div>contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = Html_1.parseHtml(lexer);
                if (parseRes.selfClose) {
                    return false;
                }
            }
            return true;
        }
    }
    // <br />contentText<div>
    // <br />contentText<!---->
    // <br />contentText</div>
    // <br />contentText<br />
    if (isClose(lexer) &&
        stack.length >= 4 &&
        stack[stack.length - 2].tokenType === lexer_1.TOKEN_SELF_CLOSE /*self-close /> <br />*/ &&
        stack[stack.length - 3].tokenType === lexer_1.TOKEN_NAME /*name*/ &&
        stack[stack.length - 4].tokenType === lexer_1.TOKEN_LEFT_PAREN /*<*/) {
        if ((lexer.sourceCode[0] === "<"
            && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<br />contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<br />contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*<br />contentText</div>*/) {
            return false;
        }
        else {
            /*<br />contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = Html_1.parseHtml(lexer);
                if (parseRes.selfClose) {
                    return false;
                }
            }
            return true;
        }
    }
    // <!---->contentText<div>
    // <!---->contentText<!---->
    // <!---->contentText</div>
    // <!---->contentText<br />
    if (isClose(lexer) &&
        stack[stack.length - 2].tokenType === lexer_1.COMMENT /*COMMENT*/) {
        if ((lexer.sourceCode[0] === "<" &&
            /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<!---->contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<!---->contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*<!---->contentText</div>*/) {
            return false;
        }
        else {
            /*<!---->contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = Html_1.parseHtml(lexer);
                if (parseRes.selfClose) {
                    return false;
                }
            }
            return true;
        }
    }
    // <!DOCTYPE html>contentText<div>
    // <!DOCTYPE html>contentText</div>
    // <!DOCTYPE html>contentText<!---->
    // <!DOCTYPE html>contentText<br />
    if (isClose(lexer) &&
        stack[stack.length - 2].tokenType === lexer_1.TOKEN_DTD /*DTD*/) {
        if ((lexer.sourceCode[0] === "<" &&
            /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<!DOCTYPE html>contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<!DOCTYPE html>contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*<!DOCTYPE html>contentText</div>*/) {
            return false;
        }
        else {
            /*<!DOCTYPE html>contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = Html_1.parseHtml(lexer);
                if (parseRes.selfClose) {
                    return false;
                }
            }
            return true;
        }
    }
    // return true
}
let newLine = 0; // 统计换行个数
let leftLine = 0; // 剩余行数
function parseText(lexer) {
    lexer.hasCache = false;
    let node = new Node();
    let content = "";
    while (contentEnd(lexer)) {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1;
            newLine++;
            content += lexer.sourceCode.slice(0, 2);
            lexer.skipSourceCode(2);
        }
        else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1;
                newLine++;
                content += lexer.sourceCode[0];
                lexer.skipSourceCode(1);
            }
            else {
                content += lexer.sourceCode[0];
                lexer.skipSourceCode(1);
            }
        }
    }
    if (newLine >= 2) {
        leftLine = newLine - 1;
        lexer.lineNum -= 1;
        newLine = 0; // reset
    }
    lexer.isIgnored();
    node.content = content;
    node.LineNum = lexer.GetLineNum();
    if (leftLine > 0) { // 如果有剩余行数，在当前节点已经设置lineNum之后，加回去
        lexer.lineNum += leftLine;
        leftLine = 0; // reset
    }
    node.type = "text";
    return node;
}
exports.parseText = parseText;
