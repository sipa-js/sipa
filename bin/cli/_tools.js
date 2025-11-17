#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const prompt = require('prompt-sync')();
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const SipaCliVersion = require('./tasks/_version');
const File = require("ruby-nice/file");
const execSync = require("child_process").execSync;
const Typifier = require('typifier');

class SipaCliTools {

    static logo() {
        const version = SipaCliVersion.getVersion();
        const row_length = 40;
        const version_padding = 3;
        let version_line = `${" ".repeat(row_length - version.length - version_padding)}${version}${" ".repeat(version_padding)}`;
        // ASCII-Font: Calvin S
        // Sub title font: Source Code Pro Bold
        return chalk.yellow.bgBlack.bold("\n                                        \n" +
            "             ┏━┓ ┳ ┏━┓ ┏━┓              \n" +
            "             ┗━┓ ┃ ┣━┛ ┣━┫              \n" +
            "             ┗━┛ ┻ ┻   ┻ ┻              \n" + chalk.bold.white.bgBlack(
                "          PARTICULARLY SIMPLE           \n") + chalk.bold.green.bgBlack(
                "             WEB FRAMEWORK              \n") + chalk.reset.yellow.bgBlack(version_line) + "\n" +
            "                                        "
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
        if (self.first_question) {
            if (preselected_option) {
                console.log('  Preselection in [' + chalk.green('brackets') + '] can be confirmed with ENTER.\n');
            }
            self.first_question = false;
        }
        let default_string = null;
        if (preselected_option) {
            default_string = ' [' + chalk.green(preselected_option) + ']';
        } else {
            default_string = '';
        }
        let input = preselected_option;
        while (true) {
            input = prompt('  ' + question + default_string + ': ');
            if (input === '') {
                input = preselected_option !== null ? preselected_option : input;
            }
            if (options) {
                if (options && typeof options[0] !== "undefined") {
                    if (options.includes(input)) {
                        break;
                    } else {
                        // CTRL+C
                        if (input === null) {
                            process.exit(1);
                        }
                        // invalid input value
                        self.printLine(chalk.red(`\n  Invalid input '${input}'.`) + `\n  Valid options are: ${options.map((e) => {
                            return chalk.green(e);
                        }).join(' | ')}\n`);
                    }
                } else {
                    break;
                }
            } else if (mandatory && !input) {
                // CTRL+C
                if (input === null) {
                    process.exit(1);
                }
                self.printLine(chalk.red('Mandatory option, please enter a valid text.' + JSON.stringify(input)));
            } else {
                // CTRL+C
                if (input === null) {
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
        if (!text) {
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
        if (!text) {
            text = '';
        }
        process.stdout.write('  ' + text);
    }

    static uniqArray(array) {
        return [...new Set(array)];
    }

    /**
     * Check if current working directory is a valid sipa project,
     * by checking for existence of sipa.json file.
     *
     * @returns {boolean}
     */
    static isRunningInsideValidSipaProject() {
        const self = SipaCliTools;
        return fs.existsSync(self.sipaConfigFilePath());
    }

    /**
     * Print error message that current working directory is not a valid sipa project
     */
    static errorNotInsideValidSipaProject() {
        const self = SipaCliTools;
        const usage = commandLineUsage(self.SECTIONS.not_inside_valid_project);
        console.log(usage);
    }

    /**
     * Check if the "sass_watch_paths" defined in sipa.json are valid
     * and return invalid ones as array.
     *
     * @returns {Array<string>}
     */
    static invalidConfigPaths() {
        const self = SipaCliTools;
        const config = self.readProjectSipaConfig();
        let paths = [];
        if (config.development_server?.sass_watch_paths?.length || 0 > 0) {
            paths = paths.concat(config.development_server.sass_watch_paths.map(e => `${self.projectBaseAppDir()}/${e}`));
        }
        let invalid_paths = [];
        paths.forEach((path) => {
            if (!fs.existsSync(path)) {
                invalid_paths.push(path);
            }
        });
        return invalid_paths;
    }

    /**
     * Print error message that invalid paths were found in sipa.json
     */
    static errorInvalidConfigPaths() {
        const self = SipaCliTools;
        const usage = commandLineUsage(self.SECTIONS.invalid_config_paths);
        console.log(usage);
    }

    /**
     * Get only the deepest dirs, without dirs between
     *
     * @example
     *
     * filterDeepDirsOnly([
     *  'a/b/c',
     *  'a/b',
     *  'a/b/c/d',
     *  'e/f',
     *  'e/f/g/h'
     *  ])
     *  // returns [
     *  //  'a/b/c/d',
     *  //  'e/f/g/h'
     *  // ]
     *
     * @param {Array<String>} dirs to filter
     */
    static filterDeepDirsOnly(dirs) {
        let filtered = [];
        dirs.forEach((dir) => {
            if (dirs.filter((e) => {
                return e.includes(dir);
            }).length === 1) {
                filtered.push(dir);
            }
        });
        return filtered;
    }

    /**
     * Get root path of the sipa framework installation
     *
     * @returns {string}
     */
    static sipaRootPath() {
        const self = SipaCliTools;
        return self.normalizePath(path.resolve(__dirname + '/../../'));
    }

    /**
     * Get project root path of the current sipa project
     *
     * @returns {string}
     */
    static projectRootPath() {
        const self = SipaCliTools;
        return self.normalizePath(process.cwd());
    }

    /**
     * Get project app folder name inside the current sipa project.
     *
     * Default is 'app' unless configured otherwise in sipa.json "base_app_dir".
     *
     * @returns {string}
     */
    static projectBaseAppDir() {
        const self = SipaCliTools;
        const config = self.readProjectSipaConfig();
        if (config?.base_app_dir) {
            if (Typifier.isString(config.base_app_dir)) {
                // remove leading and trailing slashes
                return self.normalizePath(config.base_app_dir).replaceAll(/\/$|^\//g, '')
            } else {
                console.error(`sipa.json "base_app_dir" must be of type string, but was of type ${Typifier.getType(config.base_app_dir)}`);
                process.exit(1);
            }
        } else {
            return self.DEFAULT_PROJECT_BASE_APP_DIR;
        }
    }

    /**
     * Get absolute path of project app folder path inside the current sipa project.
     *
     * @returns {string}
     */
    static projectBaseAppPath() {
        const self = SipaCliTools;
        return self.projectRootPath() + '/' + self.projectBaseAppDir();
    }

    static projectDefaultDistPath() {
        const self = SipaCliTools;
        return self.projectRootPath() + '/dist/default';
    }

    /**
     * Get sipa.json file path of the current sipa project
     *
     * @returns {string}
     */
    static sipaConfigFilePath() {
        const self = SipaCliTools;
        return SipaCliTools.projectRootPath() + '/sipa.json'
    }

    /**
     * Get package.json file path of the current sipa project
     *
     * @returns {string}
     */
    static packageJsonFilePath() {
        const self = SipaCliTools;
        return SipaCliTools.projectRootPath() + '/package.json'
    }

    /**
     * Get index.html file path of the current sipa project
     *
     * @returns {string}
     */
    static projectIndexFilePath() {
        const self = SipaCliTools;
        return SipaCliTools.projectRootPath() + '/' + self.projectBaseAppDir() + '/index.html'
    }

    static projectName() {
        const self = SipaCliTools;
        return self.readProjectPackageJson().name;
    }

    static executeHook(hook_name) {
        const self = SipaCliTools;
        if (self.isRunningInsideValidSipaProject()) {
            try {
                const config = self.readProjectSipaConfig();
                if (config?.hooks?.[hook_name]) {
                    console.log(`hook ${chalk.blue(hook_name)} (start)`);
                    const hook_process = execSync(config?.hooks?.[hook_name], {stdio: 'inherit'});
                    console.log(`hook ${chalk.blue(hook_name)} (end)`);
                }
            } catch (e) {
                console.error(`Error when executing hook '${hook_name}'`);
                console.error(e.message);
                process.exit(1);
            }
        }
    }

    static readProjectSipaConfig(use_cache = true) {
        const self = SipaCliTools;
        let config = null;
        if (!self.cached_config || use_cache === false) {
            config = JSON.parse(self.readFile(self.sipaConfigFilePath()));
            self.cached_config = Object.assign({}, config);
        } else {
            config = self.cached_config;
        }
        config = Object.assign(Object.assign({}, self.SIPA_CONFIG_DEFAULTS), config);
        if (!config.indexer) config.indexer = {};
        if (!config.indexer.ignored_files) config.indexer.ignored_files = [];
        return config;
    }

    static writeProjectSipaConfig(content) {
        const self = SipaCliTools;
        return self.writeFile(self.sipaConfigFilePath(), JSON.stringify(content, null, 2));
    }

    static readProjectPackageJson() {
        const self = SipaCliTools;
        return JSON.parse(self.readFile(self.packageJsonFilePath()));
    }

    static writeProjectPackageJson(content) {
        const self = SipaCliTools;
        return self.writeFile(self.packageJsonFilePath(), JSON.stringify(content, null, 2));
    }

    static readProjectIndexFile() {
        const self = SipaCliTools;
        return self.readFile(self.projectIndexFilePath());
    }

    static writeProjectIndexFile(content) {
        const self = SipaCliTools;
        return self.writeFile(self.projectIndexFilePath(), content);
    }

    static makeDir(dir) {
        fs.mkdirSync(dir, {recursive: true});
    }

    static makeDirOfFile(file) {
        const self = SipaCliTools;
        let final_dir = self.normalizePath(path.dirname(file));
        fs.mkdirSync(final_dir, {recursive: true});
    }

    static readFile(path, encoding = 'utf8') {
        if (!encoding) {
            encoding = undefined;
        }
        return fs.readFileSync(path, encoding).toString();
    }

    static writeFile(path, content) {
        const self = SipaCliTools;
        self.makeDirOfFile(path);
        return fs.writeFileSync(path, content);
    }

    static copyFile(src, dest) {
        const self = SipaCliTools;
        self.makeDirOfFile(dest);
        fs.copyFileSync(src, dest);
    }

    static copy(src, dest) {
        const self = SipaCliTools;
        fse.copySync(src, dest);
    }

    static isDir(path) {
        const self = SipaCliTools;
        try {
            const stat = fs.lstatSync(path);
            return stat.isDirectory();
        } catch (e) {
            return false;
        }
    }

    static isFile(path) {
        const self = SipaCliTools;
        try {
            const stat = fs.lstatSync(path);
            return stat.isFile();
        } catch (e) {
            return false;
        }
    }

    static pathExists(path) {
        const self = SipaCliTools;
        try {
            const stat = fs.lstatSync(path);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Ensure path is divided by slashes / and not back slahes \
     * to ensure compatibility with MS Windows
     *
     * @param {String} path
     */
    static normalizePath(path) {
        return path.replace(/\\/g, '/');
    }

    /**
     * Delete file or directory
     *
     * @param {String} path
     */
    static removePath(path) {
        fs.rmSync(path, {recursive: true, force: true});
    }

    static escapeRegExp(string) {
        return string.replace(/[$+.*?^(){}|[\]\\]/g, '\\$&');
    }
}

SipaCliTools.SIPA_CONFIG_DEFAULTS = {
    type: 'desktop',
    development_server: {
        host: '0.0.0.0',
        port: '7000',
        sass_watch_paths: [
            "assets/components",
            "assets/style",
            "views"
        ]
    },
    indexer: {
        ignored_files: []
    }
}

SipaCliTools.DEFAULT_PROJECT_BASE_APP_DIR = "app";

SipaCliTools.first_question = true;
SipaCliTools.cached_config = null;

SipaCliTools.SECTIONS = {};
SipaCliTools.SECTIONS.not_inside_valid_project = [
    {
        header: 'Invalid project directory',
        content: [
            '{red You can run this command at the root directory of a valid Sipa project only.}',
            '',
            `Current directory:\n {green ${SipaCliTools.projectRootPath()}}`,
            '',
            `Searched for this file but did not find it:\n {green ${SipaCliTools.sipaConfigFilePath()}}`,
        ]
    }
];

if (SipaCliTools.isRunningInsideValidSipaProject()) {
    SipaCliTools.SECTIONS.invalid_config_paths = [
        {
            header: 'Invalid paths found',
            content: [
                'The following paths in sipa.json are invalid:',
                `   → ${SipaCliTools.invalidConfigPaths().map((el) => {
                    return chalk.red(el);
                }).join("\n  → ")}`,
            ]
        }
    ];
}

module.exports = SipaCliTools;