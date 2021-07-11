"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paseComment = void 0;
function paseComment(lexer) {
    while (lexer.sourceCode.slice(0, 3) !== "-->") {
        lexer.skipSourceCode(1);
    }
    lexer.skipSourceCode(3);
    lexer.isIgnored();
    lexer.hasCache = false;
    return null;
}
exports.paseComment = paseComment;
