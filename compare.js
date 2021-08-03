const fs = require('fs')
const path = require('path')
let parser = fs.readFileSync(path.resolve(__dirname, `./out/$parser.ast.json`), {encoding: 'utf-8'})
let browser = fs.readFileSync(path.resolve(__dirname, `./out/$browser.ast.json`), {encoding: 'utf-8'})
parser = JSON.parse(parser)
browser = JSON.parse(browser)
console.log(parser, browser)

let count = browser.length > parser.length ? browser.length : parser.length;
for (let i = 0; i < count; i++) {
    let a = browser[i]
    let b = parser[i]
    if (a === undefined) {
        debugger
    }
    if (a.tag.toLowerCase() !== b.tag) {
        let resta = []
        let restb = []
        let start = i - 10 < 0 ? 0 : i - 10
        for (let s = start; s < i; s++) {
            resta.push(browser[s])
            restb.push(parser[s])
        }
        resta.push(browser[i])
        restb.push(parser[i])
        for (let s = i; s < i + 10; s++) {
            resta.push(browser[s])
            restb.push(parser[s])
        }
        debugger

    }
    // console.log(browser[i] ? browser[i].tag : "undefined", parser[i] ? parser[i].tag : "undefined")
    // expect(browser[i].tag.toLowerCase()).toBe(parser[i].tag)
    // console.assert(browser[i].tag.toLowerCase() === parser[i].tag, `${browser[i] ? browser[i].tag : "undefined"}, ${parser[i] ? parser[i].tag : "undefined"}`)
}
