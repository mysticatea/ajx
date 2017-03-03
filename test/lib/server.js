/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const Buffer = require("buffer").Buffer
const http = require("http")
const stream = require("stream")
const express = require("express")

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * The stream which accumulates the written data as a string.
 */
class ConcatStream extends stream.Writable {
    /**
     * Initialize this stream.
     */
    constructor() {
        super()
        this.buffers = []
    }

    /**
     * The accumulated data.
     * @type {string}
     */
    get value() {
        return Buffer.concat(this.buffers).toString()
    }

    /**
     * Accumulate the written chunk.
     * @param {Buffer|string} chunk The chunk to be written. Will always be a
     * buffer unless the `decodeStrings` option was set to `false`.
     * @param {string} _encoding If the chunk is a string, then `encoding` is
     * the character encoding of that string. If chunk is a `Buffer`, or if the
     * stream is operating in object mode, `encoding` may be ignored.
     * @param {function} callback Call this function (optionally with an error
     * argument) when processing is complete for the supplied chunk.
     * @returns {void}
     */
    _write(chunk, _encoding, callback) {
        this.buffers.push(chunk)
        callback(null)
    }
}

/**
 * Start the test server.
 * @returns {Promise<object>} The promise which will get fulfilled after the
 * test server started.
 */
function startServer() {
    return new Promise((resolve, reject) => {
        const app = express()
        const records = []

        /**
         * Record the given request.
         * @param {Request} req The received request to record.
         * @returns {void}
         */
        function record(req) {
            records.push({
                method: req.method,
                path: req.path,
                headers: req.headers,
                body: req.body,
            })
        }

        // Parse the request body as a string.
        app.use((req, res, next) => {
            const bodyStream = new ConcatStream()
            req.pipe(bodyStream)
                .on("finish", () => {
                    req.body = bodyStream.value
                    next()
                })
                .on("error", next)
        })

        // Record the request.
        app.all("/204", (req, res) => {
            record(req)
            res.sendStatus(204).end()
        })
        app.all("/200-text", (req, res) => {
            record(req)
            res.send(200, "hello world")
        })
        app.all("/200-json", (req, res) => {
            record(req)
            res.send(200, {hello: "world"})
        })
        app.all("/200-delay", (req, res) => {
            record(req)
            setTimeout(() => {
                res.send(200, "ok")
            }, 3000)
        })
        app.all("/404-json", (req, res) => {
            record(req)
            res.send(404, {error: "file not found"})
        })
        app.all("/500-json", (req, res) => {
            record(req)
            res.send(500, {error: "internal error"})
        })

        // Listen
        http.createServer(app)
            .on("listening", function() {
                const server = this //eslint-disable-line no-invalid-this
                const address = server.address()

                resolve({
                    url(path) {
                        return `http://localhost:${address.port}${path}`
                    },

                    result() {
                        const retv = records.slice(0)
                        records.splice(0, records.length)
                        return retv
                    },

                    dispose() {
                        server.close()
                    },
                })
            })
            .on("error", reject)
            .listen(0)
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {startServer}
