const fs = require('fs')
const path = require('path')
const request = require("request-promise")
const parser = require('./dist/parser')

async function done() {

    let html = await request({
        method: "GET",
        uri: "https://book.qidian.com/info/1027339371",
        headers: {
            "Accept": "*/*",
            "Accept-Encoding": "deflate, br",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "Connection": "keep-alive",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.59",
        },
    })

    let ast = parser.parse(html)

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
                        // console.log(top)
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
    // console.log(res.attr)
    let title = res.attr.filter((item: any) => item.name === "title")
    // console.log(title)
    console.log(`最新章节是：${title[0].value}`)
}

try {
    done()
} catch (error) {
    console.log(error)
}

