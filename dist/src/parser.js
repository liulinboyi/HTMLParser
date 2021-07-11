"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.Program = void 0;
const lexer_1 = require("./lexer");
const Html_1 = require("./parser/Html");
const parseText_1 = require("./parser/parseText");
const tagClose_1 = require("./parser/tagClose");
const DTD_1 = require("./parser/DTD");
const Comment_1 = require("./parser/Comment");
class Program {
    constructor() {
        this.type = 'root';
        this.children = [];
    }
}
exports.Program = Program;
// SourceCode ::= Statement+ 
function parseSourceCode(lexer) {
    let LineNum = lexer.GetLineNum();
    let root = parseStatements(lexer);
    root.LineNum = LineNum;
    return root;
}
// Statement
function parseStatements(lexer) {
    let root = {
        type: "root",
        children: [],
        LineNum: 1
    };
    let statements = [root];
    // 先调用LookAhead一次，将GetNextToken的结果缓存
    while (!isSourceCodeEnd(lexer.LookAhead().tokenType)) {
        let statement = {};
        statement = parseStatement(lexer);
        if (!statement)
            continue;
        let stack = statements;
        let s = statement;
        if (!s.closeTag) {
            stack[stack.length - 1].children.push(s); // 栈顶就是levalElement层级元素
            if (s.type === "tag" && !s.selfClose && !tagClose_1.isSpecialTag(s)) {
                stack.push(s);
            }
        }
        else {
            if (stack[stack.length - 1].tag !== s.tag) {
                stack[stack.length - 1].children.push(s);
                console.error(`${stack[stack.length - 1].tag} and ${s.tag} is not math! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`);
                // throw new Error(`${stack[stack.length - 1].tag} and ${s.tag} is not math! at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 100)}`)
            }
            else {
                stack.pop();
            }
        }
    }
    return root;
}
function parseStatement(lexer) {
    // 向前看一个token并跳过
    lexer.LookAheadAndSkip(lexer_1.TOKEN_IGNORED); // skip if source code start with ignored token
    let look = lexer.LookAhead().tokenType;
    let flag = false;
    let top = lexer.stack[lexer.stack.length - 1];
    if (parseText_1.isClose(lexer) &&
        top.tokenType !== lexer_1.TOKEN_LEFT_PAREN &&
        top.tokenType !== lexer_1.TOKEN_CLOSE &&
        top.tokenType !== lexer_1.TOKEN_DTD &&
        top.tokenType !== lexer_1.COMMENT) {
        flag = true;
    }
    else {
        flag = false;
    }
    if (flag) {
        return parseText_1.parseText(lexer);
    }
    else {
        switch (look) {
            case lexer_1.TOKEN_LEFT_PAREN: // <
                return Html_1.parseHtml(lexer);
            case lexer_1.TOKEN_CLOSE: // </
                return tagClose_1.parseClose(lexer);
            case lexer_1.TOKEN_DTD: // dtd
                return DTD_1.parseDtd(lexer);
            case lexer_1.COMMENT:
                return Comment_1.paseComment(lexer);
            default:
                throw new Error(`parseStatement(): unknown Statement. at line ${lexer.GetLineNum()} ${lexer.sourceCode.slice(0, 50)}`);
        }
    }
}
function isSourceCodeEnd(token) {
    return token === lexer_1.TOKEN_EOF;
}
function parse(code) {
    let lexer = lexer_1.NewLexer(code);
    let sourceCode = parseSourceCode(lexer);
    lexer.NextTokenIs(lexer_1.TOKEN_EOF);
    return sourceCode;
}
exports.parse = parse;
