import { Keywords, TokenNameMap } from "./definition";

/*
tag-open ::= '<' tag-name ws* attr-list? ws* '>'
tag-empty ::= '<' tag-name ws* attr-list? ws* '/>'
tag-close ::= '</' tag-name ws* '>'


attr-list ::= (ws+ attr)*
attr ::= attr-empty | attr-unquoted | attr-single-quoted | attr-double-quoted

attr-empty ::= attr-name
attr-unquoted ::= attr-name ws* '=' ws* attr-unquoted-value
attr-single-quoted ::= attr-name ws* "=" ws* "'" attr-single-quoted-value "'"
attr-double-quoted ::= attr-name ws* "=" ws* '"' attr-double-quoted-value '"'

tag-name ::= alphabets (alphabets | digits)*                      // digits can not become first letter
attr-name ::= [^\s"'>/=[#x0000-#x001f]+ // [^\s"'>/=[\u0000-\u001f]+

// These three items should not contain 'ambiguous ampersand'...
attr-unquoted-value ::= [^\s"'=<>`]+
attr-single-quoted-value ::= [^']*
attr-double-quoted-value ::= [^"]*

alphabets ::= [a-zA-Z]
digits ::= [0-9]
ws ::= #x9 | #xA | #xD | #x20

*/

// lexer struct
export interface Lexer {
    sourceCode: string
    lineNum: number
    nextToken: string
    nextTokenType: number
    nextTokenLineNum: number
    hasCache: boolean
    stack: Array<any>
}

// token const
export enum Tokens {
    TOKEN_EOF,                // end-of-file
    TOKEN_LEFT_PAREN,         // <
    TOKEN_TAG_NAME,           // tagName
    TOKEN_RIGHT_PAREN,        // >
    TOKEN_EQUAL,              // =
    TOKEN_QUOTE,              // "
    TOKEN_SINGLE_QUOTE,       // '
    TOKEN_LEFT_LINE,          // /
    TOKEN_DUOQUOTE,           // ""
    TOKEN_CONTENT_TEXT,       // ContentText
    TOKEN_CLOSE,              // close </
    TOKEN_DTD,                // DTD
    TOKEN_SELF_CLOSE,         // self-close /> <br />
    TOKEN_NAME,               // Name ::= [_A-Za-z][_0-9A-Za-z]*
    TOKEN_IGNORED,            // Ignored  
    INTERGER,                 // [0-9]+
    COMMENT,                  // Ignored "#" SourceCharacter Ignored
    SourceCharacter,          // 所有代码字符串
}

export const {
    TOKEN_EOF,                // end-of-file
    TOKEN_LEFT_PAREN,         // <
    TOKEN_TAG_NAME,           // tagName
    TOKEN_RIGHT_PAREN,        // >
    TOKEN_EQUAL,              // =
    TOKEN_QUOTE,              // "
    TOKEN_SINGLE_QUOTE,       // '
    TOKEN_LEFT_LINE,          // /
    TOKEN_DUOQUOTE,           // ""
    TOKEN_CONTENT_TEXT,       // ContentText
    TOKEN_CLOSE,              // close </
    TOKEN_DTD,                // DTD
    TOKEN_SELF_CLOSE,         // self-close /> <br />
    TOKEN_NAME,               // Name ::= [_A-Za-z][_0-9A-Za-z]*
    TOKEN_IGNORED,            // Ignored  
    INTERGER,                 // [0-9]+
    COMMENT,                  // Ignored "#" SourceCharacter Ignored
    SourceCharacter,          // 所有代码字符串
} = Tokens

// regex match patterns
const regexName = /^[_\d\w]+/

// 关键字
export const keywords: Keywords = {
}

export const tokenNameMap: TokenNameMap = {
    [TOKEN_EOF]: "EOF",
    [TOKEN_LEFT_PAREN]: "<",
    [TOKEN_TAG_NAME]: "tagNmae",
    [TOKEN_RIGHT_PAREN]: ">",
    [TOKEN_EQUAL]: "=",
    [TOKEN_QUOTE]: "\"",
    [TOKEN_SINGLE_QUOTE]: "'",
    [TOKEN_LEFT_LINE]: "/",
    [TOKEN_DUOQUOTE]: "\"\"",
    [TOKEN_CONTENT_TEXT]: "ContentText",
    [TOKEN_CLOSE]: "close",
    [TOKEN_DTD]: "dtd",
    [TOKEN_SELF_CLOSE]: "self-close",
    [TOKEN_NAME]: "Name",
    [TOKEN_IGNORED]: "Ignored",
    [INTERGER]: "INTERGER",
    [COMMENT]: "COMMENT",
    [SourceCharacter]: "SourceCharacter",
}

export class Lexer {
    constructor(sourceCode: string, lineNum: number, nextToken: string, nextTokenType: number, nextTokenLineNum: number) {
        this.sourceCode = sourceCode;
        this.lineNum = lineNum;
        this.nextToken = nextToken;
        this.nextTokenType = nextTokenType;
        this.nextTokenLineNum = nextTokenLineNum;
        this.hasCache = false;
        this.stack = []
    }

    get judgeIsContent() {
        const length = this.stack.length - 1
        return this.stack[length].tokenType === TOKEN_RIGHT_PAREN /*>*/ ||
            this.stack[length].tokenType === TOKEN_SELF_CLOSE /*/> <br />*/ ||
            this.stack[length].tokenType === TOKEN_DTD /*dtd*/ ||
            this.stack[length].tokenType === COMMENT /*<!---->*/
    }

    get isContentText() {
        let origin = this.sourceCode
        // while (this.stack.length > 10) {
        //     this.stack.shift()
        // }
        if (this.judgeIsContent) {
            this.isIgnored()
            if (this.sourceCode[0] === "<") {
                this.sourceCode = origin
                return false
            } else {
                return true
            }
        } else {
            return false
        }
    }
    /**
     * LookAhead (向前看) 一个 Token, 告诉我们下一个 Token 是什么
     * @returns
     */
    LookAhead(): { lineNum: number, tokenType: number, token: string } {
        // lexer.nextToken already setted
        if (this.hasCache) {
            return { tokenType: this.nextTokenType, lineNum: this.lineNum, token: this.nextToken }
        }
        // set it
        // 当前行
        let { lineNum, tokenType, token } = this.GetNextToken()
        // *
        // 下一行
        this.hasCache = true
        this.lineNum = lineNum
        this.nextTokenType = tokenType
        this.nextToken = token
        return { tokenType, lineNum, token }
    }

    LookAheadAndSkip(expectedType: number) {
        // get next token
        // 查看看下一个Token信息
        let { lineNum, tokenType, token } = this.GetNextToken()
        // not is expected type, reverse cursor
        if (tokenType != expectedType) {
            this.hasCache = true
            this.lineNum = lineNum
            this.nextTokenType = tokenType
            this.nextToken = token
        }
    }
    /**
    * 断言下一个 Token 是什么
    */
    NextTokenIs(tokenType: number) {
        const {
            lineNum: nowLineNum,
            tokenType: nowTokenType,
            token: nowToken } = this.GetNextToken()
        // syntax error
        if (tokenType != nowTokenType) {
            throw new Error(`NextTokenIs(): syntax error near '${tokenNameMap[nowTokenType]}', expected token: {${tokenNameMap[tokenType]}} but got {${tokenNameMap[nowTokenType]}}.`)
        }
        return { nowLineNum, nowToken, nowTokenType }
    }
    // MatchToken() 的封装，每一次调用，都会吃掉相应Token
    GetNextToken(): { lineNum: number, tokenType: number, token: string } {
        // next token already loaded
        if (this.hasCache) {
            // 在LookAhead和LookAheadSkip处对nextTokenLineNum进行了赋值操作
            let lineNum = this.lineNum
            let tokenType = this.nextTokenType
            let token = this.nextToken
            this.hasCache = false
            return {
                lineNum,
                tokenType,
                token
            }
        }
        return this.MatchToken()
    }
    checkCode(c: string) {
        // 确保源代码，不包含非法字符，对应着SourceCharacter的EBNF
        if (!/\u0009|\u000A|\u000D|[\u0020-\uFFFF]/.test(c)) {
            throw new Error('The source code contains characters that cannot be parsed.')
        }
    }
    // 直接跳过几个字符，返回被跳过的字符
    next(skip: number) {
        this.checkCode(this.sourceCode[0])
        const code = this.sourceCode[0]
        this.skipSourceCode(skip)
        return code
    }
    isTagNmae() {
        let origin = this.sourceCode;
        this.skipSourceCode(1)
        if (this.sourceCode[0] === "/") {
            this.sourceCode = origin
            return false
        }
        let tag_name = /[a-zA-z]+[0-9]*/.exec(this.sourceCode);
        if (tag_name) {
            let tag = tag_name[0]
            this.skipSourceCode(tag.length);
            this.isIgnored()
            this.hasCache = false
            if (this.sourceCode[0] === "=") {
                this.sourceCode = origin
                return false
            } else {
                this.sourceCode = origin
                return true
            }
        }
    }
    // 匹配Token并跳过匹配的Token
    MatchToken(): { lineNum: number, tokenType: number, token: string } {
        this.checkCode(this.sourceCode[0]) // 只做检查，不吃字符
        // check ignored
        if (this.isIgnored()) {
            let res = { lineNum: this.lineNum, tokenType: TOKEN_IGNORED, token: "Ignored" }
            this.stack.push(res)
            return res
        }
        // finish
        if (this.sourceCode.length == 0) {
            let res = { lineNum: this.lineNum, tokenType: TOKEN_EOF, token: tokenNameMap[TOKEN_EOF] }
            this.stack.push(res)
            return res
        }

        switch (this.sourceCode[0]) {
            case '<':
                if (this.sourceCode.slice(0, 4) === "<!--") {
                    this.skipSourceCode(4)
                    let res = { lineNum: this.lineNum, tokenType: COMMENT, token: tokenNameMap[COMMENT] }
                    this.stack.push(res)
                    return res
                }
                else if (this.sourceCode[1] === "!") {
                    this.skipSourceCode(2)
                    let res = { lineNum: this.lineNum, tokenType: TOKEN_DTD, token: tokenNameMap[TOKEN_DTD] }
                    this.stack.push(res)
                    return res
                } else if (this.isTagNmae()) {
                    this.skipSourceCode(1);
                    let res = { lineNum: this.lineNum, tokenType: TOKEN_LEFT_PAREN, token: "<" }
                    this.stack.push(res)
                    return res
                } else {
                    this.skipSourceCode(2)
                    let res = { lineNum: this.lineNum, tokenType: TOKEN_CLOSE, token: "</" }
                    this.stack.push(res)
                    return res
                }
            case '>':
                this.skipSourceCode(1)
                let RES_TOKEN_RIGHT_PAREN = { lineNum: this.lineNum, tokenType: TOKEN_RIGHT_PAREN /*>*/, token: ">" }
                this.stack.push(RES_TOKEN_RIGHT_PAREN)
                return RES_TOKEN_RIGHT_PAREN
            case '=': // =
                this.skipSourceCode(1)
                let RES_TOKEN_EQUAL = { lineNum: this.lineNum, tokenType: TOKEN_EQUAL, token: "=" }
                this.stack.push(RES_TOKEN_EQUAL)
                return RES_TOKEN_EQUAL
            case '"':
                this.skipSourceCode(1)
                let RES_TOKEN_QUOTE = { lineNum: this.lineNum, tokenType: TOKEN_QUOTE, token: "\"" }
                this.stack.push(RES_TOKEN_QUOTE)
                return RES_TOKEN_QUOTE
            case "'":
                this.skipSourceCode(1)
                let RES_TOKEN_SINGLE_QUOTE = { lineNum: this.lineNum, tokenType: TOKEN_SINGLE_QUOTE, token: "'" }
                this.stack.push(RES_TOKEN_SINGLE_QUOTE)
                return RES_TOKEN_SINGLE_QUOTE
            case "/":
                this.skipSourceCode(1)
                let RES_TOKEN_LEFT_LINE = { lineNum: this.lineNum, tokenType: TOKEN_LEFT_LINE, token: "/" }
                this.stack.push(RES_TOKEN_LEFT_LINE)
                return RES_TOKEN_LEFT_LINE
        }

        if (this.isContentText) {
            let contentText = /[\s\S]+/.exec(this.sourceCode[0])
            if (contentText) {
                let res = { lineNum: this.lineNum, tokenType: TOKEN_CONTENT_TEXT /*ContentText*/, token: contentText[0] }
                this.stack.push(res)
                return res
            }
        } else {
            let tag_name = /[a-zA-z]+[0-9]*/.exec(this.sourceCode);
            if (tag_name) {
                let tag = ""
                tag = tag_name[0]
                this.skipSourceCode(tag.length)
                let res = { lineNum: this.lineNum, tokenType: TOKEN_NAME /*tag_name*/, token: tag }
                this.stack.push(res)
                return res
            }
        }
        // unexpected symbol
        throw new Error(`MatchToken(): unexpected symbol near '${this.sourceCode[0]}'.`);
    }
    skipSourceCode(n: number) {
        this.sourceCode = this.sourceCode.slice(n)
    }
    nextSourceCodeIs(s: string): boolean {
        return this.sourceCode.startsWith(s)
    }
    isNewLine(c: string): boolean {
        /*
        在Windows中：
        '\r' 回车，回到当前行的行首，而不会换到下一行，如果接着输出的话，本行以前的内容会被逐一覆盖；
        '\n' 换行，换到当前位置的下一行，而不会回到行首；
        Unix系统里:
        每行结尾只有“<换行>”，即"\n"；Windows系统里面，每行结尾是“<回车><换行>”，即“\r\n”；Mac系统里，每行结尾是“<回车>”，即"\r"；。一个直接后果是，Unix/Mac系统下的文件在Windows里打开的话，所有文字会变成一行；而Windows里的文件在Unix/Mac下打开的话，在每行的结尾可能会多出一个^M符号。
        */
        // return c == '\r' || c == '\n'
        return c === '\n'
    }
    isEmpty() {
        return this.sourceCode.length === 0
    }
    isIgnored(): boolean {
        let isIgnored = false
        // target pattern
        let isNewLine = function (c: string): boolean {
            return c == '\r' || c == '\n'
        }
        let isWhiteSpace = function (c: string): boolean {
            if (['\t', '\v', '\f', ' '].includes(c)) {
                return true
            }
            return false
        }
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
                this.skipSourceCode(1)
                isIgnored = true
            } else {
                break
            }
        }
        return isIgnored
    }

    GetLineNum(): number {
        return this.lineNum
    }
}


export function NewLexer(sourceCode: string): Lexer {
    return new Lexer(sourceCode, 1, "", 0, 0) // start at line 1 in default.
}

