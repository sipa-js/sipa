#!/usr/bin/env node

const fs = require('fs');
const glob = require('glob');
const LuckyCase = require('lucky-case');

const SipaCliTools = require('./_tools');
const SipaHelper = require('./../../src/sipa/tools/sipa-helper');


class SipaCliIndexManager {
    /**
     * Add entry inside index.html at the end of the given section
     *
     * @param {string} section name of the section, e.g. 'ASSET-JS' or 'PAGE-CSS'
     * @param {string} path to the asset file
     */
    static appendEntry(section, path) {
        const self = SipaCliIndexManager;
        const tag_name = self._makeTag(path, {type: self._getAssetTypeBySection(section)});
        const section_close_tag_regex = new RegExp(`(\\s*)\\<\\!\\-\\-\\s*\\/${LuckyCase.toUpperCase(section)}\\s*\\-\\-\\>`, "gm");
        let index_content = SipaCliTools.readProjectIndexFile();
        index_content = index_content.replace(section_close_tag_regex, "$1" + tag_name + index_content.match(section_close_tag_regex));
        SipaCliTools.writeProjectIndexFile(index_content);
    }

    /**
     * Remove entry inside index.html
     *
     * @param {string} path to the asset file
     */
    static removeEntry(path) {
        const self = SipaCliIndexManager;
        const js_entry_regex = new RegExp('[\\n\\r\\c]?\\s*' + self.script_tag_regex.source.replace('src\\=\\"([^"]+)"', 'src\\=\\"' + path.replace(/\//g, '\\/') + '"') + '\\s*$', 'gm');
        const css_entry_regex = new RegExp('[\\n\\r\\c]?\\s*' + self.style_tag_regex.source.replace('href="([^"]+)"', 'href="' + path.replace(/\//g, '\\/') + '"') + '\\s*$', 'gm');
        let index_content = SipaCliTools.readProjectIndexFile();
        [js_entry_regex, css_entry_regex].forEach((entry_regex) => {
            index_content = index_content.replace(entry_regex, '');
        });
        SipaCliTools.writeProjectIndexFile(index_content);
    }

    /**
     * Get list of all javascript entries in index.html
     *
     * @returns {Array<String>}
     */
    static getJsEntries() {
        const self = SipaCliIndexManager;
        let index_content = SipaCliTools.readProjectIndexFile();
        return [...index_content.matchAll(self.script_tag_regex)].map((e) => {
            return e[1];
        });
    }

    /**
     * Get list of all javascript files in app directory
     *
     * @returns {Array<String>}
     */
    static getJsFiles() {
        const self = SipaCliIndexManager;
        const dir_prefix = SipaCliTools.projectRootPath() + '/app/';
        let files = glob.sync(dir_prefix + '**/*.js', {});
        // make paths relative to index.html
        return files.map((e) => {
            return e.substr(dir_prefix.length);
        });
    }

    /**
     * Get list of javascript files that have not yet been included to index.html
     *
     * @returns {Array<String>}
     */
    static missingJsEntries() {
        const self = SipaCliIndexManager;
        const files = self.getJsFiles();
        const entries = self.getJsEntries();
        return files.map(e => e.trim()).filter(x => !entries.includes(x.trim()));
    }

    /**
     * Get list of all stylesheet entries in index.html
     *
     * @returns {Array<String>}
     */
    static getStyleEntries() {
        const self = SipaCliIndexManager;
        let index_content = SipaCliTools.readProjectIndexFile();
        return [...index_content.matchAll(self.style_tag_regex)].map((e) => {
            return e[1];
        });
    }

    /**
     * Get list of all stylesheet files in app directory
     *
     * @returns {Array<String>}
     */
    static getStyleFiles() {
        const self = SipaCliIndexManager;
        const dir_prefix = SipaCliTools.projectRootPath() + '/app/';
        let files = glob.sync(dir_prefix + '**/*.css', {});
        // make paths relative to index.html
        return files.map((e) => {
            return e.substr(dir_prefix.length);
        });
    }

    /**
     * Get list of stylesheet files that have not yet been included to index.html
     *
     * @returns {Array<String>}
     */
    static missingStyleEntries() {
        const self = SipaCliIndexManager;
        const files = self.getStyleFiles();
        const entries = self.getStyleEntries();
        return files.filter(x => !entries.includes(x));
    }

    /**
     * Get files that have entries in index.html but do not exist
     *
     * @returns {Array<String>}
     */
    static missingFiles() {
        const self = SipaCliIndexManager;
        let existing_entries = self.getJsEntries().concat(self.getStyleEntries());
        const existing_files = self.getJsFiles().concat(self.getStyleFiles())
            .concat(self.ignoredFiles()); // add ignored entries to existing, to remove from list
        existing_entries.forEach((el, i) => {
            if (existing_files.includes(el)) {
                delete existing_entries[i];
            }
        });
        existing_entries = existing_entries.filter(e => e !== null);
        return existing_entries;
    }

    /**
     * Get entries that should exist in index.html because this files exist
     *
     * @returns {Array<String>}
     */
    static missingEntries() {
        const self = SipaCliIndexManager;
        let missing_entries = self.missingJsEntries().concat(self.missingStyleEntries());
        missing_entries.forEach((el, i) => {
            if (self.ignoredFiles().includes(el)) {
                delete missing_entries[i];
            }
        });
        missing_entries = missing_entries.filter(e => e !== null);
        return missing_entries;
    }

    /**
     * Check if there are unsolved file entries or missing files in index.html
     *
     * Returns count of missing entries.
     *
     * @returns {Number}
     */
    static missingFilesOrEntriesCount() {
        const self = SipaCliIndexManager;
        return self.missingFiles().length + self.missingEntries().length;
    }

    static ignoredFiles() {
        const self = SipaCliIndexManager;
        return SipaCliTools.readProjectSipaConfig().indexer?.ignored_files || [];
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
    static _makeTag(path, options = {type: 'page'}) {
        const self = SipaCliIndexManager;
        const default_options = {
            type: 'page'
        };
        options = SipaHelper.mergeOptions(default_options, options);
        SipaHelper.validateParams([{param_name: 'path', param_value: path, expected_type: 'string'}]);
        const final_path = self._makePath(path, options);
        if (path.endsWith('.css')) {
            return `<link rel="stylesheet" href="${final_path}">`;
        } else if (path.endsWith('.js')) {
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
     * @param {('page','layout','javascript','style','lib,'app-init')} options.type='page'
     * @param {('views/pages','assets/js','assets/style')} options.relative_prefix='views/pages'
     * @private
     */
    static _makePath(path, options = {type: 'page'}) {
        const self = SipaCliIndexManager;
        const default_options = {
            type: 'page'
        };

        options = SipaHelper.mergeOptions(default_options, options);
        const app_prefix = 'app/';
        const absolute_prefix = SipaCliTools.projectRootPath() + '/' + app_prefix;
        let relative_prefix = null;
        switch (options.type) {
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
            case 'lib':
                relative_prefix = 'assets/lib';
                break;
            case 'component':
                relative_prefix = 'assets/component';
                break;
            case 'custom':
                relative_prefix = '';
                break;
            case 'app-init':
                relative_prefix = 'config';
                break;
        }
        let final_path = path;
        if (final_path.startsWith(absolute_prefix)) {
            final_path = final_path.substring(absolute_prefix.length);
        }
        final_path = SipaHelper.cutLeadingCharacters(final_path, '/');
        if (final_path.startsWith(app_prefix)) {
            final_path = final_path.substring(app_prefix.length);
        }
        final_path = SipaHelper.cutLeadingCharacters(final_path, '/');
        if (!final_path.startsWith(relative_prefix)) {
            final_path = relative_prefix + '/' + final_path;
        }
        if (fs.existsSync(SipaCliTools.projectRootPath() + '/' + app_prefix + final_path)) {
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
            case 'LIB-JS':
            case 'LIB-CSS':
                return 'lib';
            case 'COMPONENT-JS':
            case 'COMPONENT-CSS':
                return 'component';
            case 'APP-INIT-JS':
                return 'app-init';
            case 'CUSTOM-JS':
            case 'CUSTOM-CSS':
                return 'custom';
            default:
                throw `Invalid section '${section}'`;
        }
    }

    static _getSectionByPath(path) {
        const dir_prefix = SipaCliTools.projectRootPath() + '/app/';
        const rel_path = path.replace(dir_prefix, '');
        if (rel_path.startsWith('views/pages') && rel_path.endsWith('.js')) {
            return 'PAGE-JS';
        } else if (rel_path.startsWith('views/pages') && rel_path.endsWith('.css')) {
            return 'PAGE-CSS';
        } else if (rel_path.startsWith('views/layouts') && rel_path.endsWith('.js')) {
            return 'LAYOUT-JS';
        } else if (rel_path.startsWith('views/layouts') && rel_path.endsWith('.css')) {
            return 'LAYOUT-CSS';
        } else if (rel_path.startsWith('assets/js') && rel_path.endsWith('.js')) {
            return 'ASSET-JS';
        } else if (rel_path.startsWith('assets/style') && rel_path.endsWith('.css')) {
            return 'ASSET-CSS';
        } else if (rel_path.startsWith('assets/lib') && rel_path.endsWith('.js')) {
            return 'LIB-JS';
        } else if (rel_path.startsWith('assets/lib') && rel_path.endsWith('.css')) {
            return 'LIB-CSS';
        } else if (rel_path.startsWith('assets/components') && rel_path.endsWith('.js')) {
            return 'COMPONENT-JS';
        } else if (rel_path.startsWith('assets/components') && rel_path.endsWith('.css')) {
            return 'COMPONENT-CSS';
        } else if (rel_path.startsWith('config/') && rel_path.endsWith('.js')) {
            return 'APP-INIT-JS';
        } else if (!rel_path.startsWith('files/') && rel_path.endsWith('.css')) {
            return 'CUSTOM-CSS';
        } else if (!rel_path.startsWith('files/') && rel_path.endsWith('.js')) {
            return 'CUSTOM-JS'
        }
    }
}

SipaCliIndexManager.script_tag_regex = /\<\s*script\s*.*\s*src\=\"([^"]+)"\s*\>\s*\<\/\s*script\s*\>/gm;
SipaCliIndexManager.style_tag_regex = /<\s*link\s*rel="stylesheet"\s*href="([^"]+)"\s*>/gm;

module.exports = SipaCliIndexManager;