import { Lexer } from "../lexer";

export function paseComment(lexer: Lexer) {
    while (lexer.sourceCode.slice(0, 3) !== "-->") {
        lexer.skipSourceCode(1)
    }
    lexer.skipSourceCode(3)
    lexer.isIgnored()
    lexer.hasCache = false
    return null
}