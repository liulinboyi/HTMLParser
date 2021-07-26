/*
第一次获取Cookie，后续请求，使用相同Cookie
*/
const rp = require("request-promise")

void async function () {
    let cookiejar = rp.jar();
    const data = {
        "username": "xiaoming",
        "password": "1234567890"
    }
    let optionsLogin = {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json"
        },
        uri: 'http://localhost/login',
        // simple: false,
        // resolveWithFullResponse: true,
        jar: cookiejar // Tells rp to include cookies in jar that match uri
    };

    try {
        let resLogin = await rp(optionsLogin)
        // const cookies = cookiejar.getCookieString('http://localhost/login');
        // console.log(cookies)
        console.log(resLogin)

        let optionsFind = {
            method: "GET",
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
                "Connection": "keep-alive",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36 Edg/91.0.864.59",
                // "Cookie": cookies
            },
            uri: 'http://localhost/findUserById?id=1',
            // simple: false,
            // resolveWithFullResponse: true,
            jar: cookiejar // Tells rp to include cookies in jar that match uri
        };


        let resFind = await rp(optionsFind)
        console.log(resFind)
    } catch (error) {
        console.log(error)
    }
}()
