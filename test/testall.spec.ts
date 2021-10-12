import { test, expect } from '@playwright/test';
import { chromium } from 'playwright'
const request = require("request-promise")
import { parse } from '../src/parser'
const path = require("path")
const fs = require("fs")

function getAll(source, type) {
  let current = source;
  let res = []
  let stack = Array.isArray(current) ? current : [current];
  while (stack.length) {
    let top = stack.pop();
    // console.log([top])
    if (type === "browser") {
      if (top.nodeName === "#comment") {
        continue
      }
      if (top.nodeName === "#text" && /[\r\n]+/.test(top.data)) {
        continue
      }
      if (top.nodeName === "html") { // 浏览器中DocumentType的nodeName位html
        res.push({ tag: "DTD", content: null })
        continue
      }
      res.push({ tag: top.nodeName === "#text" ? "text" : top.nodeName, content: top.nodeName === "#text" ? top.data : null })
    } else if (type === "parser") {
      if (top.type === "comment") {
        continue
      }
      // top.content.replace(/[\r\n]+/g, "").trim()
      if (top.type === "text" && /[\r\n]+/.test(top.content)) {
        continue
      }
      if (top.type === "DTD") {
        res.push({ tag: "dtd", content: top.content, LineNum: top.LineNum })
        continue
      }
      res.push({ tag: top.tag ? top.tag : "text", content: top.content, LineNum: top.LineNum })
    }
    if (top.childNodes) {
      stack.push(...top.childNodes)
    } else if (top.children) {
      // debugger
      stack.push(...top.children)
    }
  }
  return res
}


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
  "MDN_HTML.html",
  "MDN_JavaScript.html",
  "CSDN.html",

  // "CSDN_SPM.html",

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
  "test23.html",
  "google.html",

  // "005055fd7e2625aba5e8d2d370ea4914a152fe50d16620f896cdf4b1a68ba741.html",
  // "005055fd7e2625aba5e8d2d370ea4914a152fe50d16620f896cdf4b1a68ba741-origin.html",
  // "039c4b966d1f2a0c589ac0aad211fe65500ad1cb58c7f45b34251db7056803ec-origin.html",
  // ok
  "0475e5eeadaaca857eea3f36d0eda01937fe672d48be7f98ba6bc7f25ecd63d0.html",
  "078cdb456d1beb698aeed86e0f2161e442e9431c4580295f1ba4ece22741068c.html",
  "0e55dcdbeb54c88ee87942b9fef7ea5398fa9a1e83493d55844b479506a80fd8.html",
  "qidian.html",
  "test24.html",
  "test25.html",
  "test26.html",
  "qidian1.html",
  "test27.html",
  "test28.html",
  "test29.html",
  "test30.html",
  "test31.html",
  "test32.html",
  "test33.html",
  "test34.html",
  "test35.html",
  "test36.html",
  "test38.html",
  "test39.html",
]

for (let item of paths) {
  test(`${item}`, async (/*{ page }*/) => {
    let url = `http://127.0.0.1:3000/demo/${item}`
    // console.log(url)
    const web = await chromium.launch();
    const context = await web.newContext({
      javaScriptEnabled: false
    });
    const newpage = await context.newPage();
    await newpage.goto(url, {
      referer: "",
      // timeout: 30,
      waitUntil: "domcontentloaded"
    });

    await newpage.evaluateHandle(`document.body.classList.add("body")`)

    // const name = await page.innerText('title');
    // expect(name).toBe('Document');
    // const elementHandle = await page.$('body');
    // console.log(elementHandle)
    // const bodyElement = elementHandle.asElement()
    // console.log(bodyElement)

    // const aHandle = await page.evaluateHandle('document');
    // console.log(aHandle)

    // const aHandle = await page.evaluateHandle(() => document.body);
    // let doc = await aHandle.jsonValue()
    // console.log(doc)
    // const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);
    // const jsonValue = await resultHandle.jsonValue()
    // console.log(jsonValue);
    // await resultHandle.dispose();

    const aHandle = await newpage.evaluateHandle(`(${getAll.toString()})(Array.from(document.childNodes),"browser")`);
    // console.log(aHandle)
    const browser: any = await aHandle.jsonValue()

    let html = await request({
      method: "GET",
      uri: url,
      headers: {
        "Accept": "*/*",
        "Accept-Encoding": "deflate, br",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
        "Connection": "keep-alive",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.59",
      },
    })

    let ast = parse(html, false)

    // let body = search(ast, "body")

    let parser = getAll(ast.children, "parser")
    if (!fs.existsSync(path.resolve(__dirname, "../out/"))) {
      fs.mkdirSync(path.resolve(__dirname, "../out/"))
    }
    fs.writeFileSync(path.resolve(__dirname, "../out/", `./$parser.ast.json`), JSON.stringify(parser, null, 4))
    fs.writeFileSync(path.resolve(__dirname, "../out/", `./$browser.ast.json`), JSON.stringify(browser, null, 4))

    // console.log(browser, parser)
    let count = browser.length > parser.length ? browser.length : parser.length;
    for (let i = 0; i < count; i++) {
      // console.log(browser[i] ? browser[i].tag : "undefined", parser[i] ? parser[i].tag : "undefined")

      // if (browser[i] && parser[i]) {
      expect(browser[i].tag.toLowerCase()).toBe(parser[i].tag)
      // } else {
      // console.log(i)
      // console.log(browser[i], parser[i])
      // }

      // console.assert(browser[i].tag.toLowerCase() === parser[i].tag, `${browser[i] ? browser[i].tag : "undefined"}, ${parser[i] ? parser[i].tag : "undefined"}`)
    }
  });
}
