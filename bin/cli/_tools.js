#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');

class SimparticCliTools {

    static logo() {
        // ASCII-Font: Calvin S
        return chalk.yellow("\n" +
            "   ┌─┐ ┬ ┌┬┐ ┌─┐ ┌─┐ ┬─┐ ┌┬┐ ┬ ┌─┐\n" +
            "   └─┐ │ │││ ├─┘ ├─┤ ├┬┘  │  │ │  \n" +
            "   └─┘ ┴ ┴ ┴ ┴   ┴ ┴ ┴└─  ┴  ┴ └─┘\n" +
            "   Partycular simple web framework\n"
        );
    }

    /**
     * Colorize specified key values inside Object with chalk
     *
     * @param {Object} hash
     * @param {string|Array<string>} keys or key
     * @param {string} color
     * @returns {Object}
     * @private
     */
    static colorizeValues(hash, keys, color) {
        const self = SimparticCliTools;
        if (typeof keys === 'string') {
            keys = [keys];
        }
        Object.keys(hash).forEach(h_key => {
            if (keys.includes(h_key)) {
                hash[h_key] = chalk[color](hash[h_key]);
            }
            if (typeof hash[h_key] === 'object') {
                self.colorizeValues(hash[h_key], keys, color);
            }
        });
        return hash;
    }
}

module.exports = SimparticCliTools;