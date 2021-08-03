let http = require('http');
let url = require('url');
let util = require('util');
let fs = require('fs');
let path = require("path")
const {spawn} = require('child_process');
const process = require("process");
const { URL, URLSearchParams } = require('url');

const pour = (cmd, args, opts = {
    encoding: 'utf8'
}, stdout = process.stdout, stderr = process.stderr) => {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, args, opts);
        p.stdout.setEncoding('utf-8');
        p.stdout.on('data', data => {
            stdout.write(data, "utf8");
        });
        p.stderr.on('data', data => {
            stderr.write(data);
        });
        p.on('close', code => {
            resolve(code);
        });
    });
}

async function exec(shell, args, opt) {
    console.log(`${shell} ${
        args.join(" ")
    }`)
    await pour(shell, args, opt);
}

let server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url)
    console.log("decodeURIComponent",u)
    // var pathname = url.parse(u).pathname; // 获取url的pathname (/index.html)
    console.log("file:" + u.substring(1)) // 将‘/’去掉
    // console.log(__dirname, __filename)
    let curPath = path.join(__dirname, u.substring(1))
    console.log(curPath)
    fs.readFile(curPath, function (err, data) { // fs模块加载文件
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data.toString());
        }
        res.end();
    });

});

server.listen(3000, '127.0.0.1', async () => {
    console.log("服务器已经运行，请打开浏览,输入:http://127.0.0.1:3000/ 来进行访问.")
    // await exec(process.platform === 'win32' ? 'npm.cmd' : "npm", ["run", "test"])
    // process.exit(0);
});
