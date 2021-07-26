import { Lexer } from "../lexer.js";

export function paseComment(lexer: Lexer) {
    let content = ""
    while (lexer.sourceCode.slice(0, 3) !== "-->") {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1
            lexer.skipSourceCode(2)
        } else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1
                lexer.skipSourceCode(1)
            }
        }
        content += lexer.sourceCode[0]
        lexer.skipSourceCode(1)
    }
    lexer.skipSourceCode(3)
    lexer.isIgnored()
    lexer.hasCache = false
    return {
        type: "comment",
        LineNum: lexer.GetLineNum(),
        content,
    }
}