#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const prompt = require('prompt-sync')();
const path = require('path');
const fs = require('fs');
const LuckyCase = require('lucky-case');
const glob = require('glob');

const SipaCliTools = require('./_tools');

const SipaHelper = require('./../../src/sipa/tools/sipa-helper');


class SipaCliIndexManager {
    /**
     * Add entry at the end of the given section
     *
     * @param {string} section name of the section, e.g. 'ASSET-JS' or 'PAGE-CSS'
     * @param {string} path to the asset file
     */
    static appendEntry(section, path) {
        const self = SipaCliIndexManager;
        const tag_name = self._makeTag(path, { type: self._getAssetTypeBySection(section)});
        const section_close_tag_regex = new RegExp(`(\\s*)\\<\\!\\-\\-\\s*\\/${LuckyCase.toUpperCase(section)}\\s*\\-\\-\\>`, "gm");
        let index_content = self._readIndexFile();
        index_content = index_content.replace(section_close_tag_regex, "$1" + tag_name + index_content.match(section_close_tag_regex));
        self._writeIndexFile(index_content);
    }

    static removeEntry(path) {
        const self = SipaCliIndexManager;
        let entry_regex = null;
        if(path.endsWith('.js')) {
            entry_regex = new RegExp('[\\n\\r\\c]?\\s*' + self.script_tag_regex.source.replace('src\\=\\"([^"]+)"','src\\=\\"' + path.replace(/\//g,'\\/') + '"') + '\\s*$', 'gm');
        } else if(path.endsWith('.css')) {
            entry_regex = new RegExp('[\\n\\r\\c]?\\s*' + self.style_tag_regex.source.replace('href="([^"]+)"','href="' + path.replace(/\//g,'\\/') + '"') + '\\s*$', 'gm');
        }
        let index_content = self._readIndexFile();
        index_content = index_content.replace(entry_regex, '');
        self._writeIndexFile(index_content);
    }

    static getJsEntries() {
        const self = SipaCliIndexManager;
        let index_content = self._readIndexFile();
        return [...index_content.matchAll(self.script_tag_regex)].map((e) => { return e[1]; });
    }

    static getJsFiles() {
        const self = SipaCliIndexManager;
        const dir_prefix = SipaCliTools.projectRootPath() + '/app/';
        let files = glob.sync(dir_prefix + '**/*.js', {});
        // make paths relative to index.html
        return files.map((e) => { return e.substr(dir_prefix.length); });
    }

    static missingJsEntries() {
        const self = SipaCliIndexManager;
        const files = self.getJsFiles();
        const entries = self.getJsEntries();
        return files.map(e => e.trim()).filter(x => !entries.includes(x.trim()));
    }

    static getJsEntriesOrderedBySection() {
        const self = SipaCliIndexManager;
        const entries = self.getJsEntries();
        let sections = {};
        sections['LIB-JS'] = entries.filter((e) => { e.startsWith('lib/'); });
        sections['ASSET-JS'] = entries.filter((e) => { e.startsWith('assets/js/'); });
        sections['PAGE-JS'] = entries.filter((e) => { e.startsWith('views/pages/'); });
        sections['LAYOUT-JS'] = entries.filter((e) => { e.startsWith('views/layouts/'); });
        sections['APP-INIT-JS'] = entries.filter((e) => { e.startsWith('config/'); });
        return sections;
    }

    static getStyleEntries() {
        const self = SipaCliIndexManager;
        let index_content = self._readIndexFile();
        return [...index_content.matchAll(self.style_tag_regex)].map((e) => { return e[1]; });
    }

    static getStyleFiles() {
        const self = SipaCliIndexManager;
        const dir_prefix = SipaCliTools.projectRootPath() + '/app/';
        let files = glob.sync(dir_prefix + '**/*.css', {});
        // make paths relative to index.html
        return files.map((e) => { return e.substr(dir_prefix.length); });
    }

    static missingStyleEntries() {
        const self = SipaCliIndexManager;
        const files = self.getStyleFiles();
        const entries = self.getStyleEntries();
        return files.filter(x => !entries.includes(x));
    }

    static getStyleEntriesOrderedBySection() {
        const self = SipaCliIndexManager;
        const entries = self.getStyleEntries();
        let sections = {};
        sections['LIB-CSS'] = entries.filter((e) => { e.startsWith('lib/'); });
        sections['ASSET-CSS'] = entries.filter((e) => { e.startsWith('assets/style/'); });
        sections['PAGE-CSS'] = entries.filter((e) => { e.startsWith('views/pages/'); });
        sections['LAYOUT-CSS'] = entries.filter((e) => { e.startsWith('views/layouts/'); });
        return sections;
    }

    /**
     * Create a inclusion tag for js or css automatically based on the given path
     *
     * @param {string} path
     * @param {Object} options
     * @param {('page','layout','javascript','style','app-init')} options.type='page'
     * @returns {string} html tag to include js or css
     * @private
     */
    static _makeTag(path, options = { type: 'page'}) {
        const self = SipaCliIndexManager;
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
     * @param {('page','layout','javascript','style','app-init')} options.type='page'
     * @param {('views/pages','assets/js','assets/style')} options.relative_prefix='views/pages'
     * @private
     */
    static _makePath(path, options = { type: 'page'}) {
        const self = SipaCliIndexManager;
        const default_options = {
            type: 'page'
        };

        options = SipaHelper.mergeOptions(default_options, options);
        const app_prefix = 'app/';
        const absolute_prefix = SipaCliTools.projectRootPath() + '/' + app_prefix;
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
                break;
            case 'app-init':
                relative_prefix = 'config';
                break;
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
        if(fs.existsSync(SipaCliTools.projectRootPath() + '/' + app_prefix + final_path)) {
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
    static _getAssetTypeBySection(section) {
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
            case 'APP-INIT-JS':
                return 'app-init';
            default:
                throw `Invalid section '${section}'`;
        }
    }

    static _getSectionByPath(path) {
        const dir_prefix = SipaCliTools.projectRootPath() + '/app/';
        const rel_path = path.replace(dir_prefix,'');
        if(rel_path.startsWith('views/pages') && rel_path.endsWith('.js')) {
            return 'PAGE-JS';
        } else if(rel_path.startsWith('views/pages') && rel_path.endsWith('.css')) {
            return 'PAGE-CSS';
        } else if(rel_path.startsWith('views/layouts') && rel_path.endsWith('.js')) {
            return 'LAYOUT-JS';
        } else if(rel_path.startsWith('views/layouts') && rel_path.endsWith('.css')) {
            return 'LAYOUT-CSS';
        } else if(rel_path.startsWith('assets/js') && rel_path.endsWith('.js')) {
            return 'ASSET-JS';
        } else if(rel_path.startsWith('assets/style') && rel_path.endsWith('.css')) {
            return 'ASSET-CSS';
        } else if(rel_path.startsWith('lib/') && rel_path.endsWith('.js')) {
            return 'LIB-JS';
        } else if(rel_path.startsWith('lib/') && rel_path.endsWith('.css')) {
            return 'LIB-CSS';
        } else if(rel_path.startsWith('config/') && rel_path.endsWith('.js')) {
            return 'APP-INIT-JS';
        }
    }

    static _readIndexFile() {
        const self = SipaCliIndexManager;
        return fs.readFileSync(self.index_path,'utf8').toString();
    }

    static _writeIndexFile(content) {
        const self = SipaCliIndexManager;
        return fs.writeFileSync(self.index_path, content);
    }
}

SipaCliIndexManager.index_path = SipaCliTools.projectRootPath() + '/app/index.html';
SipaCliIndexManager.script_tag_regex = /\<\s*script\s*.*\s*src\=\"([^"]+)"\s*\>\s*\<\/\s*script\s*\>/gm;
SipaCliIndexManager.style_tag_regex = /<\s*link\s*rel="stylesheet"\s*href="([^"]+)"\s*>/gm;

module.exports = SipaCliIndexManager;