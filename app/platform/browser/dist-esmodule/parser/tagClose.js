import { TOKEN_RIGHT_PAREN } from "../lexer.js";
import { parseTag } from "./Html.js";
export class Node {
    constructor() {
        this.children = [];
        this.attr = [];
    }
}
export function isSpecialTag(node) {
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
export function parseClose(lexer) {
    lexer.hasCache = false;
    let node = new Node();
    node.closeTag = true;
    node.LineNum = lexer.GetLineNum();
    node.type = "tag";
    node.tag = parseTag(lexer);
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN); // >
    lexer.isIgnored();
    if (isSpecialTag(node)) {
        return null;
    }
    return node;
}
