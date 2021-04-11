#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const prompt = require('prompt-sync')();
const path = require('path');
const fs = require('fs');

class SipaCliTools {

    static logo() {
        // ASCII-Font: Calvin S
        // Sub title font: Source Code Pro Bold
        return chalk.yellow.bgGray.bold("\n                         \n" +
            "     ┏━┓ ┳ ┏━┓ ┏━┓       \n" +
            "     ┗━┓ ┃ ┣━┛ ┣━┫       \n" +
            "     ┗━┛ ┻ ┻   ┻ ┻       \n" + chalk.reset.white.bgGray(
            "  Particularly Simple    \n") + chalk.bold.green.bgGray(
            "     web framework       \n") +
            "                         \n"
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
        const self = SipaCliTools;
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
     * @param {string} question to ask the user for
     * @param {Array<string>} options set only valid options (optional)
     * @param {string} preselected_option preselected option
     * @param {boolean} mandatory if true, option can not be asked with empty string
     * @returns {string} input
     */
    static cliQuestion(question, options, preselected_option, mandatory = false) {
        const self = SipaCliTools;
        if(self.first_question) {
            if(preselected_option) {
                console.log('  Preselection in [' + chalk.green('brackets') + '] can be confirmed with ENTER.\n');
            }
            self.first_question = false;
        }
        let default_string = null;
        if(preselected_option) {
            default_string = ' [' + chalk.green(preselected_option) + ']';
        } else {
            default_string = '';
        }
        let input = preselected_option;
        while(true) {
            input = prompt('  ' + question + default_string + ': ');
            if(input === '') {
                input = preselected_option !== null ? preselected_option : input;
            }
            if(options) {
                if(options && typeof options[0] !== "undefined") {
                    if(options.includes(input)) {
                        break;
                    } else {
                        // CTRL+C
                        if(input === null) {
                            process.exit(1);
                        }
                        // invalid input value
                        self.printLine(chalk.red(`\n  Invalid input '${input}'.`) + `\n  Valid options are: ${options.map((e) => { return chalk.green(e); }).join(' | ')}\n`);
                    }
                } else {
                    break;
                }
            } else if(mandatory && !input) {
                // CTRL+C
                if(input === null) {
                    process.exit(1);
                }
                self.printLine(chalk.red('Mandatory option, please enter a valid text.' + JSON.stringify(input)));
            } else {
                // CTRL+C
                if(input === null) {
                    process.exit(1);
                }
                break;
            }
        }
        return input || '';
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

    static uniqArray(array) {
        return [...new Set(array)];
    }

    static isRunningInsideValidSipaProject() {
        const self = SipaCliTools;
        return fs.existsSync(self.SIPA_CONFIG_FILE_PATH);
    }

    static errorNotInsideValidSipaProject() {
        const self = SipaCliTools;
        const usage = commandLineUsage(self.SECTIONS.not_inside_valid_project);
        console.log(usage);
    }

    /**
     * Get only the deepest dirs, without dirs between
     * @param {Array<String>} dirs to filter
     */
    static filterDeepDirsOnly(dirs) {
        let filtered = [];
        dirs.forEach((dir, i) => {
           if(dirs.filter((e) => { return e.includes(dir); }).length === 1) {
               filtered.push(dir);
           }
        });
        return filtered;
    }

    static sipaRootPath() {
        return path.resolve(__dirname + '/../../');
    }

    static projectRootPath() {
        return process.cwd();
    }

    static projectName() {
        const self = SipaCliTools;
        return self.readProjectPackageJson().name;
    }

    static readProjectSipaConfig() {
        const self = SipaCliTools;
        return JSON.parse(fs.readFileSync(self.SIPA_CONFIG_FILE_PATH));
    }

    static writeProjectSipaConfig(content) {
        const self = SipaCliTools;
        return fs.writeFileSync(self.SIPA_CONFIG_FILE_PATH, JSON.stringify(content, null, 2));
    }

    static readProjectPackageJson() {
        const self = SipaCliTools;
        return JSON.parse(fs.readFileSync(self.PACKAGE_JSON_FILE_PATH));
    }

    static writeProjectPackageJson(content) {
        const self = SipaCliTools;
        return fs.writeFileSync(self.PACKAGE_JSON_FILE_PATH, JSON.stringify(content, null, 2));
    }
}

SipaCliTools.SIPA_CONFIG_FILE_PATH = SipaCliTools.projectRootPath() + '/sipa.json';
SipaCliTools.PACKAGE_JSON_FILE_PATH = SipaCliTools.projectRootPath() + '/package.json';
SipaCliTools.first_question = true;

SipaCliTools.SECTIONS = {};
SipaCliTools.SECTIONS.not_inside_valid_project = [
    {
        header: 'Invalid project directory',
        content: [
            '{red You can run this command at the root directory of a valid Sipa project only.}',
            '',
            `Current directory:\n {green ${SipaCliTools.projectRootPath()}}`
        ]
    }
];

module.exports = SipaCliTools;