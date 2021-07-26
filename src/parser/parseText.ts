import { COMMENT, Lexer, regexName, TOKEN_CLOSE, TOKEN_CONTENT_TEXT, TOKEN_DTD, TOKEN_LEFT_PAREN, TOKEN_NAME, TOKEN_RIGHT_PAREN, TOKEN_SELF_CLOSE } from "../lexer.js";
import { parseHtml } from "./Html.js";


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

/*
提取出来的公共代码
*/
function judgeEnd(lexer: Lexer) {
    if (lexer.sourceCode.slice(0, 2) === "</" /*在这里是什么特征看调用函数的注释部分contentText</div>*/ ||
        lexer.sourceCode.slice(0, 2) === "<!" /*在这里是什么特征看调用函数的注释部分contentText<!----> || <!DOCTYPE*/ ||
        (lexer.sourceCode[0] === "<" &&
            regexName.test(lexer.sourceCode[1])) /*在这里是什么特征看调用函数的注释部分contentText<div>*/
    ) {
        return false
    } else {
        /*在这里是什么特征看调用函数的注释部分contentText<br />*/
        if ((lexer.sourceCode[0] === "<"
            && regexName.test(lexer.sourceCode[1]))) {
            let parseRes = parseHtml(lexer)
            if (parseRes.selfClose) {
                return false
            }
        }
        return true
    }
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
        // <script>
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
        // noscript
        if (lexer.stack[length - 3].token === "noscript") {
            /*
            <script>
                '<script src="https://"><\/script>'
            </script>
            */
            let script = "</noscript>"
            if (lexer.sourceCode.slice(0, script.length) === script) {
                return false
            } else {
                return true
            }
        }
        judgeEnd(lexer)
    }
    // </div>contentText<div>
    // </div>contentText<!---->
    // </div>contentText</div>
    // </div>contentText<br />
    if (isClose(lexer) &&
        length >= 4 &&
        stack[length - 2].tokenType === TOKEN_RIGHT_PAREN /*>*/ &&
        stack[length - 3].tokenType === TOKEN_NAME /*name*/ &&
        stack[length - 4].tokenType === TOKEN_CLOSE /*</*/
    ) {
        judgeEnd(lexer)
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
        judgeEnd(lexer)
    }

    // <!---->contentText<div>
    // <!---->contentText<!---->
    // <!---->contentText</div>
    // <!---->contentText<br />
    if (isClose(lexer) &&
        stack[length - 2].tokenType === COMMENT /*COMMENT*/
    ) {
        judgeEnd(lexer)
    }

    // <!DOCTYPE html>contentText<div>
    // <!DOCTYPE html>contentText</div>
    // <!DOCTYPE html>contentText<!---->
    // <!DOCTYPE html>contentText<br />
    if (isClose(lexer) &&
        stack[length - 2].tokenType === TOKEN_DTD /*DTD*/
    ) {
        judgeEnd(lexer)
    }

    /*contentText<div>*/
    /*contentText<!----> || <!DOCTYPE*/
    /*contentText</div>*/
    /*contentText<br />*/
    if (stack[length - 1].tokenType === TOKEN_CONTENT_TEXT /*contentText*/) {
        if ((lexer.sourceCode[0] === "<" &&
            regexName.test(lexer.sourceCode[1])) /*contentText<div>*/ ||
            lexer.sourceCode.slice(0, 2) === "<!" /*contentText<!----> || <!DOCTYPE*/ ||
            lexer.sourceCode.slice(0, 2) === "</" /*contentText</div>*/
        ) {
            return false
        } else {
            /*contentText<br />*/
            if ((lexer.sourceCode[0] === "<"
                && regexName.test(lexer.sourceCode[1]))) {
                let parseRes = parseHtml(lexer)
                if (parseRes.selfClose) {
                    return false
                }
            }
            return true
        }
    }


    // return true
    throw new Error(`not find contentEnd! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`)

}

export function parseText(lexer: Lexer) {
    lexer.hasCache = false
    let node = new Node()

    lexer.isIgnored();
    node.LineNum = lexer.GetLineNum()

    let content = ""
    while (contentEnd(lexer) && !lexer.isEmpty()) {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1
            content += lexer.sourceCode.slice(0, 2)
            lexer.skipSourceCode(2)
        } else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1
                content += lexer.sourceCode[0]
                lexer.skipSourceCode(1)
            } else {
                content += lexer.sourceCode[0]
                lexer.skipSourceCode(1)
            }
        }
    }

    lexer.isIgnored();
    node.content = content

    node.type = "text"
    return node
}
