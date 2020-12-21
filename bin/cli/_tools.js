#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const prompt = require('prompt-sync')();
const path = require('path');

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

    /**
     * Prompt user for input
     *
     * @param {string} question
     * @param {Array<string>} options
     * @param {string} default_option
     * @returns {string} input
     */
    static cliQuestion(question, options, default_option, mandatory = false) {
        const self = SimparticCliTools;
        let options_string = null;
        if(options) {
            options_string = ' (' + options.join('|') + ')';
        } else {
            options_string = '';
        }
        let default_string = null;
        if(default_option) {
            default_string = ' [' + chalk.yellow(default_option) + ']';
        } else {
            default_string = '';
        }
        let input = default_option;
        while(true) {
            input = prompt('  ' + question + options_string + default_string + ': ') || default_option;
            if(options) {
                if(options && typeof options[0] !== "undefined") {
                    if(options.includes(input)) {
                        break;
                    } else {
                        self.printLine(chalk.red(`\nInvalid input '${input}'.`) + `\nValid options are: ${options.map((e) => { return chalk.green(e); }).join(' | ')}`);
                    }
                } else {
                    break;
                }
            } else if(mandatory && !input) {
                self.printLine(chalk.red('Mandatory option, please enter a valid text.'));
            } else {
                break;
            }
        }
        return input;
    }

    /**
     * Print line with trailing new line
     *
     * @param {string} text
     */
    static printLine(text) {
        if(!text) {
            text = '';
        }
        console.log('  ' + text);
    }

    /**
     * Print line without trailing new line
     *
     * @param {string} text
     */
    static print(text) {
        if(!text) {
            text = '';
        }
        process.stdout.write('  ' + text);
    }

    static projectRootPath() {
        return path.resolve(__dirname + '/../../');
    }
}

module.exports = SimparticCliTools;