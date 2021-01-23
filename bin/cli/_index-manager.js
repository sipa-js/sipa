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
        const tag_name = self._makeTag(path, { type: self._getTypeBySection(section)});
        const section_close_tag_regex = new RegExp(`(\\s*)\\<\\!\\-\\-\\s*\\/${LuckyCase.toUpperCase(section)}\\s*\\-\\-\\>`, "gm");
        let index_content = fs.readFileSync(self.index_path,'utf8').toString();
        index_content = index_content.replace(section_close_tag_regex, "$1" + tag_name + index_content.match(section_close_tag_regex));
        fs.writeFileSync(self.index_path, index_content);
    }

    /**
     * Create a inclusion tag for js or css automatically based on the given path
     *
     * @param {string} path
     * @param {Object} options
     * @param {('page','layout','javascript','style')} options.type='page'
     * @returns {string} html tag to include js or css
     * @private
     */
    static _makeTag(path, options = { type: 'page'}) {
        const self = SimparticCliIndexManager;
        const default_options = {
            type: 'page'
        };
        options = SipaHelper.mergeOptions(default_options, options);
        SipaHelper.validateParams([{ param_name: 'path', param_value: path, expected_type: 'String'}]);
        const final_path = self._makePath(path, options);
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
     * @param {Object} options
     * @param {('page','layout','javascript','style')} options.type='page'
     * @param {('views/pages','assets/js','assets/style')} options.relative_prefix='views/pages'
     * @private
     */
    static _makePath(path, options = { type: 'page'}) {
        const self = SimparticCliIndexManager;
        const default_options = {
            type: 'page'
        };

        options = SipaHelper.mergeOptions(default_options, options);
        const app_prefix = 'app/';
        const absolute_prefix = SimparticCliTools.projectRootPath() + '/' + app_prefix;
        let relative_prefix = null;
        switch(options.type) {
            case 'page':
                relative_prefix = 'views/pages';
                break;
            case 'layout':
                relative_prefix = 'views/layouts';
                break;
            case 'javascript':
                relative_prefix = 'assets/js';
                break;
            case 'style':
                relative_prefix = 'assets/style';
        }
        let final_path = path;
        if(final_path.startsWith(absolute_prefix)) {
            final_path = final_path.substring(absolute_prefix.length);
        }
        final_path = SipaHelper.cutLeadingCharacters(final_path, '/');
        if(final_path.startsWith(app_prefix)) {
            final_path = final_path.substring(app_prefix.length);
        }
        final_path = SipaHelper.cutLeadingCharacters(final_path, '/');
        if(!final_path.startsWith(relative_prefix)) {
            final_path = relative_prefix + '/' + final_path;
        }
        if(fs.existsSync(SimparticCliTools.projectRootPath() + '/' + app_prefix + final_path)) {
            return final_path;
        } else {
            throw `Could not make path of '${path}'\n${final_path}`;
        }
    }

    /**
     * Return type for given section
     *
     * @param {string} section
     * @returns {('page','layout','javascript','style')}
     * @private
     */
    static _getTypeBySection(section) {
        switch (section) {
            case 'PAGE-JS':
            case 'PAGE-CSS':
                return 'page';
            case 'LAYOUT-JS':
            case 'LAYOUT-CSS':
                return 'layout';
            case 'ASSET-JS':
                return 'javascript';
            case 'ASSET-CSS':
                return 'style';
            default:
                throw `Invalid section '${section}'`;
        }
    }
}

SimparticCliIndexManager.index_path = SimparticCliTools.projectRootPath() + '/app/index.html';

module.exports = SimparticCliIndexManager;