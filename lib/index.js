"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mint = exports.Stamp = void 0;
const js_base64_1 = require("js-base64");
const crypto_js_1 = require("crypto-js");
const bigInt = require("big-integer");
class Stamp {
    constructor(bits, date, resource, rand) {
        this.version = "1";
        this.bits = bits;
        this.date = date;
        this.resource = resource;
        this.extension = "";
        this.rand = rand;
        this.counter = bigInt(0);
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            const sha1 = (0, crypto_js_1.SHA1)(this.digest());
            const hash = sha1.toString(crypto_js_1.enc.Base64);
            const leadingZeros = countLeadingZeros((0, js_base64_1.toUint8Array)(hash));
            return leadingZeros >= this.bits;
        });
    }
    digest() {
        if (!this.header) {
            this.header = `${this.version}:${this.bits}:${formatDate(this.date)}:${this.resource}:${this.extension}:${this.rand}`;
        }
        return `${this.header}:${(0, js_base64_1.toBase64)(this.counter.toString())}`;
    }
}
exports.Stamp = Stamp;
function countLeadingZeros(arr) {
    const buff = new Uint8Array(arr);
    let leadingZeros = 0;
    for (let i = 0; i < buff.length; i++) {
        if (buff[i] === 0) {
            leadingZeros += 8;
            continue;
        }
        for (let j = 8; j > 0; j--) {
            if (!test(buff[i], j - 1)) {
                leadingZeros++;
            }
            else {
                return leadingZeros;
            }
        }
    }
    return leadingZeros;
}
function test(num, bit) {
    return (num >> bit) % 2 !== 0;
}
function formatDate(date) {
    const d = date.toISOString();
    return d.slice(0, 19).replace(/[-:T]/g, "");
}
function mint(bits, resource) {
    return __awaiter(this, void 0, void 0, function* () {
        const rnd = crypto_js_1.lib.WordArray.random(8).toString(crypto_js_1.enc.Base64);
        const s = new Stamp(bits, new Date(), resource, rnd);
        while (true) {
            const ok = yield s.check();
            if (ok) {
                return s.digest();
            }
            s.counter = s.counter.add(bigInt.one);
        }
    });
}
exports.mint = mint;
