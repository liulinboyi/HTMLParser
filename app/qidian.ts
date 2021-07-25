const fs = require('fs')
const path = require('path')

let parh = 'qidian.html.ast.json'
let astString = fs.readFileSync(path.resolve(__dirname, `../out/${parh}`), { encoding: 'utf-8' })
let ast = JSON.parse(astString)
console.log(ast)

function search(ast: any, keywords: string) {

    let stack = [ast]
    let temp = keywords.split(" ")
    let count = 0
    for (let key of temp) {
        // update detail
        while (stack.length) {
            let top = stack.pop()
            if (top.attr && top.attr.length) {
                let check = top.attr.filter((item: any) => {
                    if (item.name === "class" && item.value === key) {
                        return true
                    }
                })
                if (check.length) {
                    // debugger
                    console.log(top)
                    stack = [top]
                    count++
                    break
                }
            }
            if (top.children) {
                stack.push(...top.children)
            }
        }
    }

    return count === temp.length ? stack[0] : undefined

}

let res = search(ast, "update detail cf blue")
console.log(res.attr)
let title = res.attr.filter((item: any) => item.name === "title")
console.log(title)
console.log(title[0].value)
