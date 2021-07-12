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
<summary>AST</summary>
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
            "LineNum": 2,
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
                            "LineNum": 4,
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
                            "LineNum": 6,
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
                            "LineNum": 8,
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
                            "LineNum": 10,
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
                                    "LineNum": 12,
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
                            "LineNum": 14,
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