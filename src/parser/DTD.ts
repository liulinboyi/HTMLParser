import { Lexer } from "../lexer";

export function parseDtd(lexer: Lexer) {
    while (lexer.sourceCode[0] !== ">") {
        lexer.skipSourceCode(1)
    }
    lexer.skipSourceCode(1)
    lexer.isIgnored()
    lexer.hasCache = false
    return null
}