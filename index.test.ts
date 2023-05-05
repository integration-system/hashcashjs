import {describe, expect, jest, test} from '@jest/globals';
import {mint} from "./index";


jest.setTimeout(30000)

describe("test", () => {
    test("test", async () => {
        const s = await mint(18, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnYXRla2VlcGVyIiwiZXhwIjoxNjc3NTIwNDgzfQ.0MdRGV6t6TfXHg7Zo1yHmMCCWXDX4OournZnnFAATH4")
        console.log(s)
    })
})
