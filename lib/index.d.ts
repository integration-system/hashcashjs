import * as bigInt from "big-integer";
declare class Stamp {
    version: string;
    bits: number;
    date: Date;
    resource: string;
    extension: string;
    rand: Uint8Array;
    counter: bigInt.BigInteger;
    header?: string;
    constructor(bits: number, date: Date, resource: string, rand: Uint8Array);
    check(): Promise<boolean>;
    digest(): string;
}
declare function mint(bits: number, resource: string): Promise<string>;
export { Stamp, mint, };
