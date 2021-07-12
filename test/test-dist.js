const fs = require('fs')
const path = require('path')
const paser = require('../dist/index').paser

let paths = [
    "demo.html",
    "demo1.html",
    "demo2.html",
    "demo3.html",
    "demo4.html",
    "demo5.html",
    "test4.html",
    "test5.html",
    "test6.html",
    "test7.html",
    "test8.html",
    "MDN HTML.html",
    "MDN JavaScript.html",
    "CSDN.html",
    "CSDN_SPM.html", // error
    "test9.html",
    "test10.html",
    "test11.html",
    "test12.html",
    "test13.html",
    "test14.html",
]

for (let p of paths) {
    let code = fs.readFileSync(path.resolve(__dirname, `../demo/${p}`), {encoding: 'utf-8'})
    // console.log(code, 'code')
    if (code.length > 0) {
        console.time("test")
        let ast = paser(code)
        console.timeEnd("test")
        // console.log(__dirname, __filename)
        console.log(path.resolve(__dirname, "../out/", `./${p}.ast.json`))
        fs.writeFileSync(path.resolve(__dirname, "../out/", `./${p}.ast.json`), JSON.stringify(ast, null, 4))
    }
}
