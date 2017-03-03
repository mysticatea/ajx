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
const delay = require("./lib/delay")
const startServer = require("./lib/server").startServer

//------------------------------------------------------------------------------
// Test
//------------------------------------------------------------------------------

describe("ajx.get function", () => {
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

    describe("ajx.get for '/204' with no option:", () => {
        let responseBody = null
        let requests = null

        before(co.wrap(function* () {
            responseBody = yield ajx.get(server.url("/204"))
            requests = server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("The server", () => {
            it("should receive a GET request", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "GET")
                assert(requests[0].path === "/204")
                assert(requests[0].body === "")
            })
        })
    })

    describe("ajx.get for '/200-text' with no option:", () => {
        let responseBody = null

        before(co.wrap(function* () {
            responseBody = yield ajx.get(server.url("/200-text"))
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert.deepEqual(responseBody, "hello world")
            })
        })
    })

    describe("ajx.get for '/200-json' with no option:", () => {
        let responseBody = null

        before(co.wrap(function* () {
            responseBody = yield ajx.get(server.url("/200-json"))
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert.deepEqual(responseBody, {hello: "world"})
            })
        })
    })

    describe("ajx.get for '/204' with headers option:", () => {
        let requests = null

        before(co.wrap(function* () {
            yield ajx.get(
                server.url("/204"),
                {headers: {hello: "world"}}
            )
            requests = server.result()
        }))

        describe("The server", () => {
            it("should receive a GET request with the given header", () => {
                assert(requests.length === 1)
                assert(requests[0].method === "GET")
                assert(requests[0].path === "/204")
                assert(requests[0].body === "")
                assert(requests[0].headers.hello === "world")
            })
        })
    })

    describe("ajx.get for '/200-delay' with timeout option:", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                responseBody = yield ajx.get(
                    server.url("/200-delay"),
                    {timeout: 1000}
                )
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should has 'timeout' message", () => {
                assert(error.message === "timeout")
            })
        })
    })

    describe("ajx.get for '/200-delay' with cancelToken option:", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                const cancelToken = new ajx.CancelToken()
                const promise = ajx.get(
                    server.url("/200-delay"),
                    {cancelToken}
                )
                yield delay(1000)
                cancelToken.cancel("a cancel reason")
                responseBody = yield promise
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should has the given cancel reason as the message", () => {
                assert(error.message === "a cancel reason")
            })
            it("should be a cancel", () => {
                assert(ajx.isCancel(error))
            })
        })
    })

    describe("ajx.get for 'http://example.com:12345/unknown' with no option:", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                responseBody = yield ajx.get("http://example.com:12345/unknown")
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should have 'network error' string as the message", () => {
                assert(error.message === "network error")
            })
        })
    })

    describe("ajx.get for '/404-json' with no option:", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                responseBody = yield ajx.get(server.url("/404-json"))
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should have '404 Not Found' string as the message", () => {
                assert(error.message === "404 Not Found")
            })
            it("should have '404' number as the status", () => {
                assert(error.status === 404)
            })
            it("should have an object as the response", () => {
                assert.deepEqual(error.response, {error: "file not found"})
            })
        })
    })

    describe("ajx.get for '/500-json' with no option:", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                responseBody = yield ajx.get(server.url("/500-json"))
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should have '500 Internal Server Error' string as the message", () => {
                assert(error.message === "500 Internal Server Error")
            })
            it("should have '500' number as the status", () => {
                assert(error.status === 500)
            })
            it("should have an object as the response", () => {
                assert.deepEqual(error.response, {error: "internal error"})
            })
        })
    })

    describe("ajx.get for '/200-delay' with cancelToken option (race token 1):", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                const ct1 = ajx.CancelToken.new()
                const ct2 = ajx.CancelToken.new()
                const cancelToken = ajx.CancelToken.race([ct1, ct2])
                const promise = ajx.get(
                    server.url("/200-delay"),
                    {cancelToken}
                )
                yield delay(1000)
                ct1.cancel("a cancel reason")
                responseBody = yield promise
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should has the given cancel reason as the message", () => {
                assert(error.message === "a cancel reason")
            })
            it("should be a cancel", () => {
                assert(ajx.isCancel(error))
            })
        })
    })

    describe("ajx.get for '/200-delay' with cancelToken option (race token 2):", () => {
        let responseBody = null
        let error = null

        before(co.wrap(function* () {
            try {
                const ct1 = ajx.CancelToken.new()
                const ct2 = ajx.CancelToken.new()
                const cancelToken = ajx.CancelToken.race([ct1, ct2])
                const promise = ajx.get(
                    server.url("/200-delay"),
                    {cancelToken}
                )
                yield delay(1000)
                ct2.cancel("a cancel reason")
                responseBody = yield promise
            }
            catch (thisError) {
                error = thisError
            }
            server.result()
        }))

        describe("the response body", () => {
            it("should be null", () => {
                assert(responseBody === null)
            })
        })

        describe("the error", () => {
            it("should be an Error object", () => {
                assert(error instanceof Error)
            })
            it("should has the given cancel reason as the message", () => {
                assert(error.message === "a cancel reason")
            })
            it("should be a cancel", () => {
                assert(ajx.isCancel(error))
            })
        })
    })
})
