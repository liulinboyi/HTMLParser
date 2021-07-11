import { Lexer, TOKEN_RIGHT_PAREN } from "../lexer";
import { parseTag } from "./Html";

export interface Node {
    LineNum?: number,
    children?: Array<any>,
    attr: Array<any>,
    type?: string,
    tag?: string,
    selfClose?: boolean
    closeTag?: boolean
}

export class Node {
    constructor() {
        this.children = []
        this.attr = []
    }
}

export function isSpecialTag(node: any) {
    let tags = [
        "img",
        "source",
        "link",
        "meta",
        "area",
        "input",
    ]
    return tags.includes(node.tag)
}

export function parseClose(lexer: Lexer) {
    lexer.hasCache = false
    let node = new Node()
    node.closeTag = true
    node.LineNum = lexer.GetLineNum()
    node.type = "tag"
    node.tag = parseTag(lexer)
    lexer.NextTokenIs(TOKEN_RIGHT_PAREN) // >
    lexer.isIgnored()
    if (isSpecialTag(node)) {
        return null
    }
    return node
}