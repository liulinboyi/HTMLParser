import { COMMENT, Lexer, TOKEN_CLOSE, TOKEN_DTD, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_RIGHT_PAREN, TOKEN_SELF_CLOSE, TOKEN_TAG_NAME } from "../lexer";
import { parseHtml } from "./Html";


export interface Node {
    LineNum?: number,
    children?: Array<any>,
    content: string,
    type?: string,
    selfClose?: boolean
}

export class Node {
    constructor() {
        this.content = ""
    }
}

export function isClose(lexer: Lexer) {
    const length = lexer.stack.length
    const topTwo = length >= 2 ? lexer.stack[length - 2].tokenType : ""

    const isTOKEN_DTD = topTwo === TOKEN_DTD
    const isCOMMENT = topTwo === COMMENT
    if (length >= 2 &&
        (isTOKEN_DTD /*dtd*/ ||
            isCOMMENT /*comment*/)
    ) {
        return true
    }

    if (length < 4) return false

    const topThree = lexer.stack[length - 3].tokenType
    const topFour = lexer.stack[length - 4].tokenType
    const isTOKEN_RIGHT_PAREN = topTwo === TOKEN_RIGHT_PAREN
    const isTOKEN_NAME = topThree === TOKEN_NAME
    // </a>
    let one = isTOKEN_RIGHT_PAREN /*>*/ &&
        isTOKEN_NAME /*tag_name*/ &&
        topFour === TOKEN_CLOSE /*</*/;
    // <a>
    let close = isTOKEN_RIGHT_PAREN /*>*/ &&
        topThree === TOKEN_NAME /*tag_name*/ &&
        topFour === TOKEN_LEFT_PAREN /*<*/;
    // />
    let selfClose = topTwo === TOKEN_SELF_CLOSE; // /> <br />
    return one || close || selfClose;
}

function contentEnd(lexer: Lexer) {
    // <div>contentText</div>
    // <div>contentText<div>
    // <meta>contentText<!---->
    // <div>contentText<br /> || <div>contentText<br 属性    />
    let stack = lexer.stack
    const length = stack.length
    if (isClose(lexer) &&
        length >= 4 &&
        stack[length - 2].tokenType === TOKEN_RIGHT_PAREN /*>*/ &&
        stack[length - 3].tokenType === TOKEN_NAME /*name*/ &&
        stack[length - 4].tokenType === TOKEN_LEFT_PAREN /*<*/
    ) {
        if (lexer.stack[length - 3].token === "script") {
            /*
            <script>
                '<script src="https://"><\/script>'
            </script>
            */
            let script = "</script>"
            if (lexer.sourceCode.slice(0, script.length) === script) {
                return false
            } else {
                return true
            }
        }
        if (lexer.sourceCode.slice(0, 2) === "</" /*<div>contentText</div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<meta>contentText<!---->*/ ||
            (lexer.sourceCode[0] === "<" &&
                /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<div>contentText<div>*/
        ) {
            return false
        } else {
            /*<div>contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = parseHtml(lexer)
                if (parseRes.selfClose) {
                    return false
                }
            }
            return true
        }
    }
    // </div>contentText<div>
    // </div>contentText<!---->
    // </div>contentText</div>
    // </div>contentText<br />
    if (isClose(lexer) &&
        length >= 4 &&
        stack[length - 2].tokenType === TOKEN_RIGHT_PAREN /*>*/ &&
        stack[length - 3].tokenType === TOKEN_NAME /*name*/ &&
        stack[length - 4].tokenType === TOKEN_CLOSE /*</*/) {
        if (
            (lexer.sourceCode[0] === "<" &&
                /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*</div>contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*</div>contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*</div>contentText</div>*/) {
            return false
        } else {
            /*</div>contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = parseHtml(lexer)
                if (parseRes.selfClose) {
                    return false
                }
            }
            return true
        }
    }
    // <br />contentText<div>
    // <br />contentText<!---->
    // <br />contentText</div>
    // <br />contentText<br />

    if (isClose(lexer) &&
        length >= 4 &&
        stack[length - 2].tokenType === TOKEN_SELF_CLOSE /*self-close /> <br />*/ &&
        stack[length - 3].tokenType === TOKEN_NAME /*name*/ &&
        stack[length - 4].tokenType === TOKEN_LEFT_PAREN /*<*/
    ) {
        if ((lexer.sourceCode[0] === "<"
            && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<br />contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<br />contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*<br />contentText</div>*/
        ) {
            return false
        } else {
            /*<br />contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = parseHtml(lexer)
                if (parseRes.selfClose) {
                    return false
                }
            }
            return true
        }
    }

    // <!---->contentText<div>
    // <!---->contentText<!---->
    // <!---->contentText</div>
    // <!---->contentText<br />
    if (isClose(lexer) &&
        stack[length - 2].tokenType === COMMENT /*COMMENT*/
    ) {
        if ((lexer.sourceCode[0] === "<" &&
            /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<!---->contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<!---->contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*<!---->contentText</div>*/) {
            return false
        } else {
            /*<!---->contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = parseHtml(lexer)
                if (parseRes.selfClose) {
                    return false
                }
            }
            return true
        }
    }

    // <!DOCTYPE html>contentText<div>
    // <!DOCTYPE html>contentText</div>
    // <!DOCTYPE html>contentText<!---->
    // <!DOCTYPE html>contentText<br />
    if (isClose(lexer) &&
        stack[length - 2].tokenType === TOKEN_DTD /*DTD*/
    ) {
        if ((lexer.sourceCode[0] === "<" &&
            /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1])) /*<!DOCTYPE html>contentText<div>*/ ||
            lexer.sourceCode.slice(0, 4) === "<!--" /*<!DOCTYPE html>contentText<!---->*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*<!DOCTYPE html>contentText</div>*/
        ) {
            return false
        } else {
            /*<!DOCTYPE html>contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && /[a-zA-z]+[0-9]*/.test(lexer.sourceCode[1]))) {
                let parseRes = parseHtml(lexer)
                if (parseRes.selfClose) {
                    return false
                }
            }
            return true
        }
    }


    // return true

}
let newLine = 0 // 统计换行个数
let leftLine = 0 // 剩余行数
export function parseText(lexer: Lexer) {
    lexer.hasCache = false
    let node = new Node()
    let content = ""
    while (contentEnd(lexer)) {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1
            newLine++
            content += lexer.sourceCode.slice(0, 2)
            lexer.skipSourceCode(2)
        } else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1
                newLine++
                content += lexer.sourceCode[0]
                lexer.skipSourceCode(1)
            } else {
                content += lexer.sourceCode[0]
                lexer.skipSourceCode(1)
            }
        }
    }
    if (newLine >= 2) {
        leftLine = newLine - 1
        lexer.lineNum -= 1
        newLine = 0 // reset
    }
    lexer.isIgnored();
    node.content = content
    node.LineNum = lexer.GetLineNum()

    if (leftLine > 0) { // 如果有剩余行数，在当前节点已经设置lineNum之后，加回去
        lexer.lineNum += leftLine
        leftLine = 0 // reset
    }

    node.type = "text"
    return node
}
