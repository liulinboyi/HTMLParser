"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseClose = exports.isSpecialTag = exports.Node = void 0;
const lexer_1 = require("../lexer");
const Html_1 = require("./Html");
class Node {
    constructor() {
        this.children = [];
        this.attr = [];
    }
}
exports.Node = Node;
function isSpecialTag(node) {
    let tags = [
        "img",
        "source",
        "link",
        "meta",
        "area",
        "input",
        "br"
    ];
    return tags.includes(node.tag);
}
exports.isSpecialTag = isSpecialTag;
function parseClose(lexer) {
    lexer.hasCache = false;
    let node = new Node();
    node.closeTag = true;
    node.LineNum = lexer.GetLineNum();
    node.type = "tag";
    node.tag = Html_1.parseTag(lexer);
    lexer.NextTokenIs(lexer_1.TOKEN_RIGHT_PAREN); // >
    // lexer.isIgnored()
    if (isSpecialTag(node)) {
        return null;
    }
    return node;
}
exports.parseClose = parseClose;
