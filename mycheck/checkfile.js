const fs = require('fs')
const path = require('path')
const paser = require('../dist/index').paser

const files = fs.readdirSync(path.resolve(__dirname, "../files"))

for (let i = 10; i < 20; i++) {
    console.log("-----------------------------------------------------")
    console.log(files[i], `   ${i}`)
    let code = fs.readFileSync(path.resolve(__dirname, `../files/${
        files[i]
    }`), {encoding: 'utf-8'})

    console.time("test")
    let ast = paser(code)
    console.timeEnd("test")

}
