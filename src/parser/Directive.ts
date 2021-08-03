import { Lexer } from "../lexer";

export function paseDirective(lexer: Lexer) {
    let content = ""
    while (lexer.sourceCode.slice(0, 1) !== "]") {
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
    content += lexer.sourceCode[0] // ]加入content
    lexer.skipSourceCode(1) // ]
    lexer.isIgnored() // 空格
    lexer.skipSourceCode(1) // >
    lexer.hasCache = false
    return {
        type: "comment", // 在浏览器中解析成comment了
        LineNum: lexer.GetLineNum(),
        content,
    }
}