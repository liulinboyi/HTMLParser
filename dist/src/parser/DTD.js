"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDtd = void 0;
function parseDtd(lexer) {
    while (lexer.sourceCode[0] !== ">") {
        lexer.skipSourceCode(1);
    }
    lexer.skipSourceCode(1);
    lexer.isIgnored();
    lexer.hasCache = false;
    return null;
}
exports.parseDtd = parseDtd;
