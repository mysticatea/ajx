/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const assert = require("assert")
const co = require("co")
const ajx = require("..")
const startServer = require("./lib/server").startServer

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("ajx.put function", () => {
    let server = null

    before(co.wrap(function* () {
        server = yield startServer()
    }))
    after(() => {
        if (server != null) {
            server.dispose()
            server = null
        }
    })

    describe("ajx.put for '/204' with string 'hello' and no option:", () => {
        let responseBody = null
        let requests = null

        before(co.wrap(function* () {
            responseBody = yield ajx.put(server.url("/204"), "hello")
            requests = server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("The server", () => {
            it("should receive a PUT request", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "PUT")
                assert(requests[0].path === "/204")
                assert(requests[0].headers["content-type"] === "text/plain;charset=UTF-8")
                assert(requests[0].body === "hello")
            })
        })
    })

    describe("ajx.put for '/204' with object '{hello: \"world\"}' and no option:", () => {
        let responseBody = null
        let requests = null

        before(co.wrap(function* () {
            responseBody = yield ajx.put(server.url("/204"), {hello: "world"})
            requests = server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("The server", () => {
            it("should receive a PUT request", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "PUT")
                assert(requests[0].path === "/204")
                assert(requests[0].headers["content-type"] === "application/json;charset=UTF-8")
                assert(requests[0].body === "{\"hello\":\"world\"}")
            })
        })
    })

    describe("ajx.put for '/204' with a FormData object and no option:", () => {
        let responseBody = null
        let requests = null

        before(co.wrap(function* () {
            const formData = new FormData()
            formData.append("name", "foo")
            formData.append("password", "123456")
            responseBody = yield ajx.put(server.url("/204"), formData)
            requests = server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("The server", () => {
            it("should receive a PUT request", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "PUT")
                assert(requests[0].path === "/204")
                assert(requests[0].headers["content-type"].startsWith("multipart/form-data; boundary="))

                const boundary = requests[0].headers["content-type"].slice("multipart/form-data; boundary=".length)
                const expectedBody = [
                    `--${boundary}`,
                    "Content-Disposition: form-data; name=\"name\"",
                    "",
                    "foo",
                    `--${boundary}`,
                    "Content-Disposition: form-data; name=\"password\"",
                    "",
                    "123456",
                    `--${boundary}--`,
                    "",
                ].join("\r\n")

                assert(requests[0].body === expectedBody)
            })
        })
    })

    describe("ajx.put for '/204' with a HTMLFormElement object and no option:", () => {
        let responseBody = null
        let requests = null

        before(co.wrap(function* () {
            const form = document.createElement("form")
            form.innerHTML = "<input type=\"text\" name=\"name\" value=\"foo\"><input type=\"password\" name=\"password\" value=\"123456\">"
            responseBody = yield ajx.put(server.url("/204"), form)
            requests = server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("The server", () => {
            it("should receive a PUT request", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "PUT")
                assert(requests[0].path === "/204")
                assert(requests[0].headers["content-type"].startsWith("multipart/form-data; boundary="))

                const boundary = requests[0].headers["content-type"].slice("multipart/form-data; boundary=".length)
                const expectedBody = [
                    `--${boundary}`,
                    "Content-Disposition: form-data; name=\"name\"",
                    "",
                    "foo",
                    `--${boundary}`,
                    "Content-Disposition: form-data; name=\"password\"",
                    "",
                    "123456",
                    `--${boundary}--`,
                    "",
                ].join("\r\n")

                assert(requests[0].body === expectedBody)
            })
        })
    })
})
