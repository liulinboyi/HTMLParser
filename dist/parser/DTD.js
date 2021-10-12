"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDtd = void 0;
class DTD {
    constructor() {
        this.type = "DTD";
    }
}
function parseDtd(lexer) {
    let dtd = new DTD();
    let content = "";
    while (lexer.sourceCode[0] !== ">") {
        if (lexer.nextSourceCodeIs("\r\n") || lexer.nextSourceCodeIs("\n\r")) {
            lexer.lineNum += 1;
            content += lexer.sourceCode.slice(0, 2);
            lexer.skipSourceCode(2);
            continue;
        }
        else {
            if (lexer.isNewLine(lexer.sourceCode[0])) {
                lexer.lineNum += 1;
                content += lexer.sourceCode.slice(0, 1);
                lexer.skipSourceCode(1);
                continue;
            }
        }
        content += lexer.sourceCode[0];
        lexer.skipSourceCode(1);
    }
    lexer.skipSourceCode(1);
    lexer.isIgnored();
    lexer.hasCache = false;
    dtd.content = content;
    dtd.LineNum = lexer.GetLineNum();
    return dtd;
}
exports.parseDtd = parseDtd;
