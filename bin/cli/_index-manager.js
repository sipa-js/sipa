#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const prompt = require('prompt-sync')();
const path = require('path');
const fs = require('fs');
const LuckyCase = require('lucky-case');

const SimparticCliTools = require('./_tools');

const SipaHelper = require('./../../src/simpartic/tools/sipa-helper');


class SimparticCliIndexManager {
    /**
     * Add entry at the end of the given section
     *
     * @param {string} section name of the section, e.g. 'ASSET-JS' or 'PAGE-CSS'
     * @param {string} path to the asset file
     */
    static appendEntry(section, path) {
        const self = SimparticCliIndexManager;
        const tag_name = self._makeTag(path);
        const section_close_tag_regex = new RegExp(`(\\s*)\\<\\!\\-\\-\\s*\\/${LuckyCase.toUpperCase(section)}\\s*\\-\\-\\>`, "gm");
        let index_content = fs.readFileSync(self.index_path,'utf8').toString();
        index_content = index_content.replace(section_close_tag_regex, "$1" + tag_name + index_content.match(section_close_tag_regex));
        fs.writeFileSync(self.index_path, index_content);
    }

    /**
     * Create a inclusion tag for js or css automatically based on the given path
     *
     * @param {string} path
     * @returns {string} html tag to include js or css
     * @private
     */
    static _makeTag(path) {
        const self = SimparticCliIndexManager;
        SipaHelper.validateParams([{ param_name: 'path', param_value: path, expected_type: 'String'}]);
        const final_path = self._makePath(path);
        if(path.endsWith('.css')) {
            return `<link rel="stylesheet" href="${final_path}">`;
        } else if(path.endsWith('.js')) {
            return `<script type="text/javascript" src="${final_path}"></script>`;
        } else {
            throw `Invalid file extension '${path.substr(path.lastIndexOf('.'))}'. Supported extensions are '.css' and '.js'`;
        }
    }

    /**
     * Complete or cut the given path to be correct for index.html inclusion
     *
     * @param {string} path
     * @private
     */
    static _makePath(path) {
        const absolute_prefix = SimparticCliTools.projectRootPath() + '/app/';
        const relative_prefix = 'app/';
        const page_prefix = 'views/pages';
        let final_path = path;
        if(final_path.startsWith(absolute_prefix)) {
            final_path = final_path.substring(absolute_prefix.length);
        }
        final_path = SipaHelper.cutLeadingCharacters(final_path, '/');
        if(final_path.startsWith(relative_prefix)) {
            final_path = final_path.substring(relative_prefix.length);
        }
        final_path = SipaHelper.cutLeadingCharacters(final_path, '/');
        if(!final_path.startsWith(page_prefix)) {
            final_path = page_prefix + '/' + final_path;
        }
        if(fs.existsSync(SimparticCliTools.projectRootPath() + '/app/' + final_path)) {
            return final_path;
        } else {
            throw `Could not make path of '${path}'`;
        }
    }
}

SimparticCliIndexManager.index_path = SimparticCliTools.projectRootPath() + '/app/index.html';

module.exports = SimparticCliIndexManager;