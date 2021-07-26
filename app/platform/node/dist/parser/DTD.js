"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDtd = void 0;
function parseDtd(lexer) {
    let content = "";
    while (lexer.sourceCode[0] !== ">") {
        content += lexer.sourceCode[0];
        lexer.skipSourceCode(1);
    }
    lexer.skipSourceCode(1);
    lexer.isIgnored();
    lexer.hasCache = false;
    return {
        type: "DTD",
        LineNum: lexer.GetLineNum(),
        content
    };
}
exports.parseDtd = parseDtd;
