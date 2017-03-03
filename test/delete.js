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

describe("ajx.delete function", () => {
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

    describe("ajx.delete for '/204' with no option:", () => {
        let responseBody = null
        let requests = null

        before(co.wrap(function* () {
            responseBody = yield ajx.delete(server.url("/204"))
            requests = server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("The server", () => {
            it("should receive a DELETE request", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "DELETE")
                assert(requests[0].path === "/204")
                assert(requests[0].body === "")
            })
        })
    })
})
