import { test, expect } from '@playwright/test';
const request = require("request-promise")
import { parse } from '../src/parser'

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
      res.push({ tag: top.tagName ? top.tagName : "text", content: top.data })
    } else if (type === "parser") {
      if (top.type === "comment") {
        continue
      }
      if (top.type === "text" && /[\r\n]+/.test(top.content)) {
        continue
      }
      res.push({ tag: top.tag ? top.tag : "text", content: top.content })
    }
    if (top.childNodes) {
      stack.push(...top.childNodes)
    } else if (top.children) {
      stack.push(...top.children)
    }
  }
  return res
}

test('test26.html', async ({ page }) => {
  // encodeURIComponent
  let url = "http://127.0.0.1:3000/demo/test26.html"
  await page.goto(url, {
    referer: "",
    // timeout: 30,
    waitUntil: "domcontentloaded"
  });

  await page.evaluateHandle(`document.body.classList.add("body")`)

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

  const aHandle = await page.evaluateHandle(`(${getAll.toString()})(Array.from(document.childNodes),"browser")`);
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

  let ast = parse(html)

  // let body = search(ast, "body")

  let parser = getAll(ast.children, "parser")

  // console.log(browser, parser)
  let count = browser.length > parser.length ? browser.length : parser.length;
  for (let i = 0; i < count; i++) {
    // console.log(browser[i] ? browser[i].tag : "undefined", parser[i] ? parser[i].tag : "undefined")
    expect(browser[i].tag.toLowerCase()).toBe(parser[i].tag)
    // console.assert(browser[i].tag.toLowerCase() === parser[i].tag, `${browser[i] ? browser[i].tag : "undefined"}, ${parser[i] ? parser[i].tag : "undefined"}`)
  }
});