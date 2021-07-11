"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Execute = void 0;
const parser_1 = require("./parser");
function Execute(code) {
    let ast = {};
    // parse
    ast = parser_1.parse(code);
    for (let i = 0; i < ast.children.length; i++) {
        if (ast.children[i].type === "COMMENT") { // 如果是注释，删除
            ast.children.splice(i, 1);
            i--;
        }
    }
    // console.log(JSON.stringify(ast, null, 4), '\r\rAST')
    console.log("--------------------------------------------");
    return ast;
}
exports.Execute = Execute;
