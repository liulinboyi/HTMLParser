const fs = require('fs')
const path = require('path')
import { paser } from '../src/index'

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
    "test15.html",
    "test16.html",
    "test17.html",
    "test18.html",
    "test19.html",
    "test20.html",
    "test21.html",
    "test22.html",
    "005055fd7e2625aba5e8d2d370ea4914a152fe50d16620f896cdf4b1a68ba741.html",
    "005055fd7e2625aba5e8d2d370ea4914a152fe50d16620f896cdf4b1a68ba741-origin.html",
    "039c4b966d1f2a0c589ac0aad211fe65500ad1cb58c7f45b34251db7056803ec-origin.html",
    "0475e5eeadaaca857eea3f36d0eda01937fe672d48be7f98ba6bc7f25ecd63d0.html",
    "078cdb456d1beb698aeed86e0f2161e442e9431c4580295f1ba4ece22741068c.html",
    "0e55dcdbeb54c88ee87942b9fef7ea5398fa9a1e83493d55844b479506a80fd8.html",
]

for (let p of paths) {
    let code = fs.readFileSync(path.resolve(__dirname, `../demo/${p}`), { encoding: 'utf-8' })
    // console.log(code, 'code')
    if (code.length > 0) {
        // console.time("test")
        let ast = paser(code)
        // console.timeEnd("test")
        // console.log(__dirname, __filename)
        console.log(path.resolve(__dirname, "../out/", `./${p}.ast.json`))
        fs.writeFileSync(path.resolve(__dirname, "../out/", `./${p}.ast.json`), JSON.stringify(ast, null, 4))
    }
}
