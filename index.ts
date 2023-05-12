import {toBase64} from "js-base64";
import {enc, lib, SHA1} from "crypto-js"
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

    check(): boolean {
        const sha1 = SHA1(this.digest())
        const buff = cryptJsWordArrayToUint8Array(sha1)
        const leadingZeros = countLeadingZeros(buff)
        return leadingZeros >= this.bits
    }

    digest(): string {
        if (!this.header) {
            this.header = `${this.version}:${this.bits}:${formatDate(this.date)}:${this.resource}:${this.extension}:${this.rand}`
        }
        return `${this.header}:${toBase64(this.counter.toString())}`
    }
}

function cryptJsWordArrayToUint8Array(wordArray): Uint8Array {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
    let i = 0 /*dst*/, j = 0 /*src*/;
    while (true) {
        // here i is a multiple of 4
        if (i == l)
            break;
        let w = words[j++];
        result[i++] = (w & 0xff000000) >>> 24;
        if (i == l)
            break;
        result[i++] = (w & 0x00ff0000) >>> 16;
        if (i == l)
            break;
        result[i++] = (w & 0x0000ff00) >>> 8;
        if (i == l)
            break;
        result[i++] = (w & 0x000000ff);
    }
    return result;
}

function countLeadingZeros(buff: Uint8Array): number {
    let leadingZeros = 0;
    for (let i = 0; i < buff.length; i++) {
        if (buff[i] === 0) {
            leadingZeros += 8
            continue
        }
        for (let j = 8; j > 0; j--) {
            if (!test(buff[i], j - 1)) {
                leadingZeros++
            } else {
                return leadingZeros
            }
        }
    }
    return leadingZeros
}

function test(num, bit) {
    return (num >> bit) % 2 !== 0
}

function formatDate(date: Date) {
    const d = date.toISOString()
    return d.slice(0, 19).replace(/[-:T]/g, "")
}

async function mint(bits: number, resource: string): Promise<string> {
    const rnd = lib.WordArray.random(8).toString(enc.Base64);

    const s = new Stamp(bits, new Date(), resource, rnd)
    return new Promise((resolve) => {
        function round() {
            for (let i = 0; i < 1000; i++) {
                if (s.check()) {
                    resolve(s.digest());
                    return
                }
                s.counter = s.counter.add(bigInt.one)
            }
            setTimeout(round, 0);
        }

        round();
    });
}

export {
    Stamp,
    mint,
}
