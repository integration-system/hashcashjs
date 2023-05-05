import {toBase64, toUint8Array} from "js-base64";
import {SHA1, enc, lib} from "crypto-js"
import * as bigInt from "big-integer";

class Stamp {
    version: string
    bits: number
    date: Date
    resource: string
    extension: string
    rand: string
    counter: bigInt.BigInteger
    header?: string

    constructor(bits: number, date: Date, resource: string, rand: string) {
        this.version = "1"
        this.bits = bits
        this.date = date
        this.resource = resource
        this.extension = ""
        this.rand = rand
        this.counter = bigInt(0)
    }

    async check(): Promise<boolean> {
        const sha1 = SHA1(this.digest())
        const hash = sha1.toString(enc.Base64);
        const leadingZeros = countLeadingZeros(toUint8Array(hash))
        return leadingZeros >= this.bits
    }

    digest(): string {
        if (!this.header) {
            this.header = `${this.version}:${this.bits}:${formatDate(this.date)}:${this.resource}:${this.extension}:${this.rand}`
        }
        return `${this.header}:${toBase64(this.counter.toString())}`
    }
}

function countLeadingZeros(arr: ArrayBuffer): number {
    const buff = new Uint8Array(arr)
    let leadingZeros = 0;
    for (let i = 0; i < buff.length; i++) {
        if (buff[i] === 0) {
            leadingZeros += 8
            continue
        }
        for (let j = 8; j > 0; j--) {
            if (!test(buff[i], j-1)) {
                leadingZeros++
            } else {
                return leadingZeros
            }
        }
    }
    return leadingZeros
}

function test(num, bit){
    return (num>>bit) % 2 !== 0
}

function formatDate(date: Date) {
    const d = date.toISOString()
    return d.slice(0,19).replace(/[-:T]/g,"")
}

async function mint(bits: number, resource: string): Promise<string> {
    const rnd = lib.WordArray.random(8).toString(enc.Base64);

    const s = new Stamp(bits, new Date(), resource, rnd)
    while(true) {
        const ok = await s.check()
        if (ok) {
            return s.digest()
        }
        s.counter = s.counter.add(bigInt.one)
    }
}

export {
    Stamp,
    mint,
}
