import { Lexer } from "../lexer";

export function paseComment(lexer: Lexer) {
    let content = ""
    while (lexer.sourceCode.slice(0, 3) !== "-->") {
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