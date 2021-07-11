import { parse } from "./parser"

export function Execute(code: string) {
    let ast: any = {}

    // parse
    ast = parse(code)

    for (let i = 0; i < ast.children.length; i++) {
        if (ast.children[i].type === "COMMENT") { // 如果是注释，删除
            ast.children.splice(i, 1)
            i--;
        }
    }

    // console.log(JSON.stringify(ast, null, 4), '\r\rAST')
    console.log("--------------------------------------------")
    return ast
}
