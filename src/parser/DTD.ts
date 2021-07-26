import { Lexer } from "../lexer.js";

export function parseDtd(lexer: Lexer) {
    let content = ""
    while (lexer.sourceCode[0] !== ">") {
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