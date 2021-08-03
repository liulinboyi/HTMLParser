import { Lexer } from "../lexer";

export function parseDtd(lexer: Lexer) {
    let content = ""
    while (lexer.sourceCode[0] !== ">") {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1
            content += lexer.sourceCode.slice(0, 2)
            lexer.skipSourceCode(2)
            continue
        } else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1
                content += lexer.sourceCode.slice(0, 1)
                lexer.skipSourceCode(1)
                continue
            }
        }
        content += lexer.sourceCode[0]
        lexer.skipSourceCode(1)
    }
    lexer.skipSourceCode(1)
    lexer.isIgnored()
    lexer.hasCache = false
    return {
        type: "DTD",
        LineNum: lexer.GetLineNum(),
        content
    }
}