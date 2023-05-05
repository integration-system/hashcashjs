import * as bigInt from "big-integer";
declare class Stamp {
    version: string;
    bits: number;
    date: Date;
    resource: string;
    extension: string;
    rand: string;
    counter: bigInt.BigInteger;
    header?: string;
    constructor(bits: number, date: Date, resource: string, rand: string);
    check(): Promise<boolean>;
    digest(): string;
}
declare function mint(bits: number, resource: string): Promise<string>;
export { Stamp, mint, };
