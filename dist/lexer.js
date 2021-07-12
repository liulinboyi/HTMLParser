"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewLexer = exports.Lexer = exports.tokenNameMap = exports.keywords = exports.SourceCharacter = exports.COMMENT = exports.INTERGER = exports.TOKEN_IGNORED = exports.TOKEN_NAME = exports.TOKEN_SELF_CLOSE = exports.TOKEN_DTD = exports.TOKEN_CLOSE = exports.TOKEN_CONTENT_TEXT = exports.TOKEN_DUOQUOTE = exports.TOKEN_LEFT_LINE = exports.TOKEN_SINGLE_QUOTE = exports.TOKEN_QUOTE = exports.TOKEN_EQUAL = exports.TOKEN_RIGHT_PAREN = exports.TOKEN_TAG_NAME = exports.TOKEN_LEFT_PAREN = exports.TOKEN_EOF = exports.Tokens = void 0;
// token const
var Tokens;
(function (Tokens) {
    Tokens[Tokens["TOKEN_EOF"] = 0] = "TOKEN_EOF";
    Tokens[Tokens["TOKEN_LEFT_PAREN"] = 1] = "TOKEN_LEFT_PAREN";
    Tokens[Tokens["TOKEN_TAG_NAME"] = 2] = "TOKEN_TAG_NAME";
    Tokens[Tokens["TOKEN_RIGHT_PAREN"] = 3] = "TOKEN_RIGHT_PAREN";
    Tokens[Tokens["TOKEN_EQUAL"] = 4] = "TOKEN_EQUAL";
    Tokens[Tokens["TOKEN_QUOTE"] = 5] = "TOKEN_QUOTE";
    Tokens[Tokens["TOKEN_SINGLE_QUOTE"] = 6] = "TOKEN_SINGLE_QUOTE";
    Tokens[Tokens["TOKEN_LEFT_LINE"] = 7] = "TOKEN_LEFT_LINE";
    Tokens[Tokens["TOKEN_DUOQUOTE"] = 8] = "TOKEN_DUOQUOTE";
    Tokens[Tokens["TOKEN_CONTENT_TEXT"] = 9] = "TOKEN_CONTENT_TEXT";
    Tokens[Tokens["TOKEN_CLOSE"] = 10] = "TOKEN_CLOSE";
    Tokens[Tokens["TOKEN_DTD"] = 11] = "TOKEN_DTD";
    Tokens[Tokens["TOKEN_SELF_CLOSE"] = 12] = "TOKEN_SELF_CLOSE";
    Tokens[Tokens["TOKEN_NAME"] = 13] = "TOKEN_NAME";
    Tokens[Tokens["TOKEN_IGNORED"] = 14] = "TOKEN_IGNORED";
    Tokens[Tokens["INTERGER"] = 15] = "INTERGER";
    Tokens[Tokens["COMMENT"] = 16] = "COMMENT";
    Tokens[Tokens["SourceCharacter"] = 17] = "SourceCharacter";
})(Tokens = exports.Tokens || (exports.Tokens = {}));
exports.TOKEN_EOF = Tokens.TOKEN_EOF, exports.TOKEN_LEFT_PAREN = Tokens.TOKEN_LEFT_PAREN, exports.TOKEN_TAG_NAME = Tokens.TOKEN_TAG_NAME, exports.TOKEN_RIGHT_PAREN = Tokens.TOKEN_RIGHT_PAREN, exports.TOKEN_EQUAL = Tokens.TOKEN_EQUAL, exports.TOKEN_QUOTE = Tokens.TOKEN_QUOTE, exports.TOKEN_SINGLE_QUOTE = Tokens.TOKEN_SINGLE_QUOTE, exports.TOKEN_LEFT_LINE = Tokens.TOKEN_LEFT_LINE, exports.TOKEN_DUOQUOTE = Tokens.TOKEN_DUOQUOTE, exports.TOKEN_CONTENT_TEXT = Tokens.TOKEN_CONTENT_TEXT, exports.TOKEN_CLOSE = Tokens.TOKEN_CLOSE, exports.TOKEN_DTD = Tokens.TOKEN_DTD, exports.TOKEN_SELF_CLOSE = Tokens.TOKEN_SELF_CLOSE, exports.TOKEN_NAME = Tokens.TOKEN_NAME, exports.TOKEN_IGNORED = Tokens.TOKEN_IGNORED, exports.INTERGER = Tokens.INTERGER, exports.COMMENT = Tokens.COMMENT, exports.SourceCharacter = Tokens.SourceCharacter;
// regex match patterns
const regexName = /^[_\d\w]+/;
// 关键字
exports.keywords = {};
exports.tokenNameMap = {
    [exports.TOKEN_EOF]: "EOF",
    [exports.TOKEN_LEFT_PAREN]: "<",
    [exports.TOKEN_TAG_NAME]: "tagNmae",
    [exports.TOKEN_RIGHT_PAREN]: ">",
    [exports.TOKEN_EQUAL]: "=",
    [exports.TOKEN_QUOTE]: "\"",
    [exports.TOKEN_SINGLE_QUOTE]: "'",
    [exports.TOKEN_LEFT_LINE]: "/",
    [exports.TOKEN_DUOQUOTE]: "\"\"",
    [exports.TOKEN_CONTENT_TEXT]: "ContentText",
    [exports.TOKEN_CLOSE]: "close",
    [exports.TOKEN_DTD]: "dtd",
    [exports.TOKEN_SELF_CLOSE]: "self-close",
    [exports.TOKEN_NAME]: "Name",
    [exports.TOKEN_IGNORED]: "Ignored",
    [exports.INTERGER]: "INTERGER",
    [exports.COMMENT]: "COMMENT",
    [exports.SourceCharacter]: "SourceCharacter",
};
class Lexer {
    constructor(sourceCode, lineNum, nextToken, nextTokenType, nextTokenLineNum) {
        this.sourceCode = sourceCode;
        this.lineNum = lineNum;
        this.nextToken = nextToken;
        this.nextTokenType = nextTokenType;
        this.nextTokenLineNum = nextTokenLineNum;
        this.hasCache = false;
        this.stack = [];
    }
    get judgeIsContent() {
        const length = this.stack.length - 1;
        return this.stack[length].tokenType === exports.TOKEN_RIGHT_PAREN /*>*/ ||
            this.stack[length].tokenType === exports.TOKEN_SELF_CLOSE /*/> <br />*/ ||
            this.stack[length].tokenType === exports.TOKEN_DTD /*dtd*/ ||
            this.stack[length].tokenType === exports.COMMENT; /*<!---->*/
    }
    get isContentText() {
        let origin = this.sourceCode;
        // while (this.stack.length > 10) {
        //     this.stack.shift()
        // }
        if (this.judgeIsContent) {
            this.isIgnored();
            if (this.sourceCode[0] === "<") {
                this.sourceCode = origin;
                return false;
            }
            else {
                return true;
            }
        }
        else {
            return false;
        }
    }
    /**
     * LookAhead (向前看) 一个 Token, 告诉我们下一个 Token 是什么
     * @returns
     */
    LookAhead() {
        // lexer.nextToken already setted
        if (this.hasCache) {
            return { tokenType: this.nextTokenType, lineNum: this.lineNum, token: this.nextToken };
        }
        // set it
        // 当前行
        let { lineNum, tokenType, token } = this.GetNextToken();
        // *
        // 下一行
        this.hasCache = true;
        this.lineNum = lineNum;
        this.nextTokenType = tokenType;
        this.nextToken = token;
        return { tokenType, lineNum, token };
    }
    LookAheadAndSkip(expectedType) {
        // get next token
        // 查看看下一个Token信息
        let { lineNum, tokenType, token } = this.GetNextToken();
        // not is expected type, reverse cursor
        if (tokenType != expectedType) {
            this.hasCache = true;
            this.lineNum = lineNum;
            this.nextTokenType = tokenType;
            this.nextToken = token;
        }
    }
    /**
    * 断言下一个 Token 是什么
    */
    NextTokenIs(tokenType) {
        const { lineNum: nowLineNum, tokenType: nowTokenType, token: nowToken } = this.GetNextToken();
        // syntax error
        if (tokenType != nowTokenType) {
            throw new Error(`NextTokenIs(): syntax error near '${exports.tokenNameMap[nowTokenType]}', expected token: {${exports.tokenNameMap[tokenType]}} but got {${exports.tokenNameMap[nowTokenType]}}.`);
        }
        return { nowLineNum, nowToken, nowTokenType };
    }
    // MatchToken() 的封装，每一次调用，都会吃掉相应Token
    GetNextToken() {
        // next token already loaded
        if (this.hasCache) {
            // 在LookAhead和LookAheadSkip处对nextTokenLineNum进行了赋值操作
            let lineNum = this.lineNum;
            let tokenType = this.nextTokenType;
            let token = this.nextToken;
            this.hasCache = false;
            return {
                lineNum,
                tokenType,
                token
            };
        }
        return this.MatchToken();
    }
    checkCode(c) {
        // 确保源代码，不包含非法字符，对应着SourceCharacter的EBNF
        if (!/\u0009|\u000A|\u000D|[\u0020-\uFFFF]/.test(c)) {
            throw new Error('The source code contains characters that cannot be parsed.');
        }
    }
    // 直接跳过几个字符，返回被跳过的字符
    next(skip) {
        this.checkCode(this.sourceCode[0]);
        const code = this.sourceCode[0];
        this.skipSourceCode(skip);
        return code;
    }
    isTagNmae() {
        let origin = this.sourceCode;
        this.skipSourceCode(1);
        if (this.sourceCode[0] === "/") {
            this.sourceCode = origin;
            return false;
        }
        let tag_name = /[a-zA-z]+[0-9]*/.exec(this.sourceCode);
        if (tag_name) {
            let tag = tag_name[0];
            this.skipSourceCode(tag.length);
            this.isIgnored();
            this.hasCache = false;
            if (this.sourceCode[0] === "=") {
                this.sourceCode = origin;
                return false;
            }
            else {
                this.sourceCode = origin;
                return true;
            }
        }
    }
    // 匹配Token并跳过匹配的Token
    MatchToken() {
        this.checkCode(this.sourceCode[0]); // 只做检查，不吃字符
        // check ignored
        if (this.isIgnored()) {
            let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_IGNORED, token: "Ignored" };
            this.stack.push(res);
            return res;
        }
        // finish
        if (this.sourceCode.length == 0) {
            let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_EOF, token: exports.tokenNameMap[exports.TOKEN_EOF] };
            this.stack.push(res);
            return res;
        }
        switch (this.sourceCode[0]) {
            case '<':
                if (this.sourceCode.slice(0, 4) === "<!--") {
                    this.skipSourceCode(4);
                    let res = { lineNum: this.lineNum, tokenType: exports.COMMENT, token: exports.tokenNameMap[exports.COMMENT] };
                    this.stack.push(res);
                    return res;
                }
                else if (this.sourceCode[1] === "!") {
                    this.skipSourceCode(2);
                    let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_DTD, token: exports.tokenNameMap[exports.TOKEN_DTD] };
                    this.stack.push(res);
                    return res;
                }
                else if (this.isTagNmae()) {
                    this.skipSourceCode(1);
                    let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_LEFT_PAREN, token: "<" };
                    this.stack.push(res);
                    return res;
                }
                else {
                    this.skipSourceCode(2);
                    let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_CLOSE, token: "</" };
                    this.stack.push(res);
                    return res;
                }
            case '>':
                this.skipSourceCode(1);
                let RES_TOKEN_RIGHT_PAREN = { lineNum: this.lineNum, tokenType: exports.TOKEN_RIGHT_PAREN /*>*/, token: ">" };
                this.stack.push(RES_TOKEN_RIGHT_PAREN);
                return RES_TOKEN_RIGHT_PAREN;
            case '=': // =
                this.skipSourceCode(1);
                let RES_TOKEN_EQUAL = { lineNum: this.lineNum, tokenType: exports.TOKEN_EQUAL, token: "=" };
                this.stack.push(RES_TOKEN_EQUAL);
                return RES_TOKEN_EQUAL;
            case '"':
                this.skipSourceCode(1);
                let RES_TOKEN_QUOTE = { lineNum: this.lineNum, tokenType: exports.TOKEN_QUOTE, token: "\"" };
                this.stack.push(RES_TOKEN_QUOTE);
                return RES_TOKEN_QUOTE;
            case "'":
                this.skipSourceCode(1);
                let RES_TOKEN_SINGLE_QUOTE = { lineNum: this.lineNum, tokenType: exports.TOKEN_SINGLE_QUOTE, token: "'" };
                this.stack.push(RES_TOKEN_SINGLE_QUOTE);
                return RES_TOKEN_SINGLE_QUOTE;
            case "/":
                this.skipSourceCode(1);
                let RES_TOKEN_LEFT_LINE = { lineNum: this.lineNum, tokenType: exports.TOKEN_LEFT_LINE, token: "/" };
                this.stack.push(RES_TOKEN_LEFT_LINE);
                return RES_TOKEN_LEFT_LINE;
        }
        if (this.isContentText) {
            let contentText = /[\s\S]+/.exec(this.sourceCode[0]);
            if (contentText) {
                let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_CONTENT_TEXT /*ContentText*/, token: contentText[0] };
                this.stack.push(res);
                return res;
            }
        }
        else {
            let tag_name = /[a-zA-z]+[0-9]*/.exec(this.sourceCode);
            if (tag_name) {
                let tag = "";
                tag = tag_name[0];
                this.skipSourceCode(tag.length);
                let res = { lineNum: this.lineNum, tokenType: exports.TOKEN_NAME /*tag_name*/, token: tag };
                this.stack.push(res);
                return res;
            }
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
    }
    skipSourceCode(n) {
        this.sourceCode = this.sourceCode.slice(n);
    }
    nextSourceCodeIs(s) {
        return this.sourceCode.startsWith(s);
    }
    isNewLine(c) {
        /*
        在Windows中：
        '\r' 回车，回到当前行的行首，而不会换到下一行，如果接着输出的话，本行以前的内容会被逐一覆盖；
        '\n' 换行，换到当前位置的下一行，而不会回到行首；
        Unix系统里:
        每行结尾只有“<换行>”，即"\n"；Windows系统里面，每行结尾是“<回车><换行>”，即“\r\n”；Mac系统里，每行结尾是“<回车>”，即"\r"；。一个直接后果是，Unix/Mac系统下的文件在Windows里打开的话，所有文字会变成一行；而Windows里的文件在Unix/Mac下打开的话，在每行的结尾可能会多出一个^M符号。
        */
        // return c == '\r' || c == '\n'
        return c === '\n';
    }
    isEmpty() {
        return this.sourceCode.length === 0;
    }
    isIgnored() {
        let isIgnored = false;
        // target pattern
        let isNewLine = function (c) {
            return c == '\r' || c == '\n';
        };
        let isWhiteSpace = function (c) {
            if (['\t', '\v', '\f', ' '].includes(c)) {
                return true;
            }
            return false;
        };
        // matching 匹配isIgnored的情况，把isIgnored的字符都吃掉
        while (this.sourceCode.length > 0) {
            // if (this.nextSourceCodeIs("\r\n") || this.nextSourceCodeIs("\n\r")) {
            //     this.skipSourceCode(2)
            //     this.lineNum += 1
            //     isIgnored = true
            // } else 
            // if (isNewLine(this.sourceCode[0])) {
            //     this.skipSourceCode(1)
            //     this.lineNum += 1
            //     isIgnored = true
            // } else 
            if (isWhiteSpace(this.sourceCode[0])) {
                this.skipSourceCode(1);
                isIgnored = true;
            }
            else {
                break;
            }
        }
        return isIgnored;
    }
    GetLineNum() {
        return this.lineNum;
    }
}
exports.Lexer = Lexer;
function NewLexer(sourceCode) {
    return new Lexer(sourceCode, 1, "", 0, 0); // start at line 1 in default.
}
exports.NewLexer = NewLexer;
