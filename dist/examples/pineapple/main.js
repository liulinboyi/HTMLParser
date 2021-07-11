"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const backend_1 = require("../../src/backend");
const fs_1 = __importDefault(require("fs"));
const args = process.argv.slice(2);
if (args[0]) {
    let code = '';
    try {
        code = fs_1.default.readFileSync(args[0], { encoding: 'utf-8' });
    }
    catch (error) {
        console.log(`Error reading file: ${args[0]}`);
    }
    if (code.length > 0) {
        backend_1.Execute(code);
    }
}
