# HTML Parser

## 解析HTML

## HTML

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div>
        <h1 v-if="res.value" name='11' @click="tes">11{{res.value}}</h1>
    </div>
    <a href="http://github.com/"></a>
</body>
</html>
```

## AST
<details>
<summary>点击查看详情(Click to view details)</summary>
<pre><code>
{
    "type": "root",
    "children": [
        {
            "type": "DTD",
            "LineNum": 1,
            "content": "DOCTYPE html"
        },
        {
            "content": "\r\n",
            "LineNum": 1,
            "type": "text"
        },
        {
            "children": [
                {
                    "content": "\r\n",
                    "LineNum": 2,
                    "type": "text"
                },
                {
                    "children": [
                        {
                            "content": "\r\n    ",
                            "LineNum": 3,
                            "type": "text"
                        },
                        {
                            "children": [],
                            "attr": [
                                {
                                    "name": "charset",
                                    "value": "UTF-8"
                                }
                            ],
                            "LineNum": 4,
                            "type": "tag",
                            "tag": "meta"
                        },
                        {
                            "content": "\r\n    ",
                            "LineNum": 4,
                            "type": "text"
                        },
                        {
                            "children": [],
                            "attr": [
                                {
                                    "name": "http-equiv",
                                    "value": "X-UA-Compatible"
                                },
                                {
                                    "name": "content",
                                    "value": "IE=edge"
                                }
                            ],
                            "LineNum": 5,
                            "type": "tag",
                            "tag": "meta"
                        },
                        {
                            "content": "\r\n    ",
                            "LineNum": 5,
                            "type": "text"
                        },
                        {
                            "children": [],
                            "attr": [
                                {
                                    "name": "name",
                                    "value": "viewport"
                                },
                                {
                                    "name": "content",
                                    "value": "width=device-width, initial-scale=1.0"
                                }
                            ],
                            "LineNum": 6,
                            "type": "tag",
                            "tag": "meta"
                        },
                        {
                            "content": "\r\n    ",
                            "LineNum": 6,
                            "type": "text"
                        },
                        {
                            "children": [
                                {
                                    "content": "Document",
                                    "LineNum": 7,
                                    "type": "text"
                                }
                            ],
                            "attr": [],
                            "LineNum": 7,
                            "type": "tag",
                            "tag": "title"
                        },
                        {
                            "content": "\r\n",
                            "LineNum": 7,
                            "type": "text"
                        }
                    ],
                    "attr": [],
                    "LineNum": 3,
                    "type": "tag",
                    "tag": "head"
                },
                {
                    "content": "\r\n",
                    "LineNum": 8,
                    "type": "text"
                },
                {
                    "children": [
                        {
                            "content": "\r\n    ",
                            "LineNum": 9,
                            "type": "text"
                        },
                        {
                            "children": [
                                {
                                    "content": "\r\n        ",
                                    "LineNum": 10,
                                    "type": "text"
                                },
                                {
                                    "children": [
                                        {
                                            "content": "11{{res.value}}",
                                            "LineNum": 11,
                                            "type": "text"
                                        }
                                    ],
                                    "attr": [
                                        {
                                            "name": "v-if",
                                            "value": "res.value"
                                        },
                                        {
                                            "name": "name",
                                            "value": "11"
                                        },
                                        {
                                            "name": "@click",
                                            "value": "tes"
                                        }
                                    ],
                                    "LineNum": 11,
                                    "type": "tag",
                                    "tag": "h1"
                                },
                                {
                                    "content": "\r\n    ",
                                    "LineNum": 11,
                                    "type": "text"
                                }
                            ],
                            "attr": [],
                            "LineNum": 10,
                            "type": "tag",
                            "tag": "div"
                        },
                        {
                            "content": "\r\n    ",
                            "LineNum": 12,
                            "type": "text"
                        },
                        {
                            "children": [],
                            "attr": [
                                {
                                    "name": "href",
                                    "value": "http://github.com/"
                                }
                            ],
                            "LineNum": 13,
                            "type": "tag",
                            "tag": "a"
                        },
                        {
                            "content": "\r\n",
                            "LineNum": 13,
                            "type": "text"
                        }
                    ],
                    "attr": [],
                    "LineNum": 9,
                    "type": "tag",
                    "tag": "body"
                },
                {
                    "content": "\r\n",
                    "LineNum": 14,
                    "type": "text"
                }
            ],
            "attr": [
                {
                    "name": "lang",
                    "value": "en"
                }
            ],
            "LineNum": 2,
            "type": "tag",
            "tag": "html"
        }
    ],
    "LineNum": 1
}
</code></pre>
</details>

## 添加应用
[查找节点](https://github.com/liulinboyi/HTMLParser-App/tree/main/platform)

## TIPS

> 无运行时依赖

没有做到浏览器那样兼容性巨好，HTML写成啥样都不报错都会解析，我只解析了一部分奇葩写法~有的HTML写法太奇葩了，要兼容就需要更多的分支和处理，需要更多的精力就算了。

## 注意

#### ~~tsc编译后无法加上.js后缀，导致无法使用module，所以在所有ts文件导入加上了js后缀~~
#### ~~https://segmentfault.com/q/1010000038671707~~
#### ~~[社区讨论](https://github.com/microsoft/TypeScript/issues/16577)~~

#### 已解决，写了个[脚本](./script/addSuffixJs.js)，将所有编译后的ES modules的导入导出部分加上了js后缀

## 测试
#### 使用[playwright](https://github.com/microsoft/playwright.git)和浏览器生成的DOM结构做了对比，除了一些奇葩写法，其他基本没问题。
