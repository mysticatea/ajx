/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2016 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
"use strict"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Wait for the given duration.
 * @param {number} timeout The timeout in milliseconds.
 * @returns {void}
 */
function delay(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout)
    })
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = delay
