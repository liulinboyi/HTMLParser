import { Execute } from '../../src/backend'
import fs from "fs";
const args = process.argv.slice(2)
if (args[0]) {
    let code = ''

    try {
        code = fs.readFileSync(args[0], { encoding: 'utf-8' })
    } catch (error) {
        console.log(`Error reading file: ${args[0]}`)
    }

    if (code.length > 0) {
        Execute(code)
    }
}
