#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const path = require('path');
const glob = require("glob");
const execSync = require("child_process").execSync;

const SipaCliTools = require('./../_tools');
const SipaCliIndexManager = require('./../_index-manager');

class SipaCliBuild {
    static build() {
        const self = SipaCliBuild;
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        if(SipaCliIndexManager.missingFilesOrEntriesCount() > 0) {
            let section = self.SECTIONS.unresolved_files;
            section[0].content[0] = section[0].content[0].replace('{{count}}', SipaCliIndexManager.missingFilesOrEntriesCount());
            console.log(commandLineUsage(section));
            return;
        }
        console.log(commandLineUsage(self.SECTIONS.build));
        SipaCliTools.makeDir(self.paths.dist_base_dir);
        self.createDistIndexHtml();
        self.createMinifiedJsFile();
        self.createMinifiedCssFile();
        self.copyStaticFiles();
    }

    static createDistIndexHtml() {
        const self = SipaCliBuild;
        const target_path = self.paths.dist_base_dir + '/index.html';
        SipaCliTools.printLine(`→ building ${chalk.green('index.html')} ...`);
        SipaCliTools.writeFile(target_path, self._generateDistIndexHtml());
    }

    static createMinifiedJsFile() {
        const self = SipaCliBuild;
        const index_js_files = SipaCliIndexManager.getJsEntries();
        let final_js_file_content = "";
        SipaCliTools.printLine(`→ merge javascript files to minify ...`);
        index_js_files.forEach((file) => {
            SipaCliTools.printLine(`  - ${file} ... `);
            let file_content = SipaCliTools.readFile(self.paths.app_base_dir + '/' + file);
            final_js_file_content += "\n" + file_content;
        });
        const final_file_path = self.paths.dist_base_dir + '/' + self.paths.dist_index_minified_js;
        SipaCliTools.writeFile(final_file_path, final_js_file_content);
        SipaCliTools.printLine(`    → minify javascript ...`);
        const terser_path = path.resolve(`${SipaCliTools.sipaRootPath()}/node_modules/terser/bin/terser`);
        const minify_command = `node ${terser_path} "${final_file_path}" -m -c -o "${final_file_path}"`;
        execSync(minify_command);
    }

    static createMinifiedCssFile() {
        const self = SipaCliBuild;
        const index_css_files = SipaCliIndexManager.getStyleEntries();
        let final_css_file_content = "";
        SipaCliTools.printLine(`→ merge stylesheet files to minify ...`);
        index_css_files.forEach((file) => {
            SipaCliTools.printLine(`  - ${file} ... `);
            let file_content = SipaCliTools.readFile(self.paths.app_base_dir + '/' + file);
            final_css_file_content += "\n" + file_content;
        });
        const final_file_path = self.paths.dist_base_dir + '/' + self.paths.dist_index_minified_css;
        // remove any multi line comments
        final_css_file_content = final_css_file_content.replace(/\/\*[^*]*\*+([^\/][^*]*\*+)*\//gms, '');
        SipaCliTools.writeFile(final_file_path, final_css_file_content);
        SipaCliTools.printLine(`    → minify css ...`);
        const sass_path = path.resolve(`${SipaCliTools.sipaRootPath()}/node_modules/sass/sass.js`);
        const minify_command = `node ${sass_path} "${final_file_path}" --no-source-map --style=compressed "${final_file_path}"`;
        execSync(minify_command);
    }

    static copyStaticFiles() {

    }

    /**
     * Generate distribution index.html, based on development index.html
     *
     * The document beginning, the HEADER part of the original file, as well as
     * the body tag are taken from the development file and paths for minified javascript and stylesheets added.
     *
     * @returns {string}
     * @private
     */
    static _generateDistIndexHtml() {
        const self = SipaCliBuild;
        const file_content = SipaCliTools.readProjectIndexFile();
        const regex = self.ORIGINAL_INDEX_SOURCES_REGEXP;
        regex.lastIndex = 0;
        const regex_results = regex.exec(file_content);
        regex.lastIndex = 0;
        const doc_beginning = regex_results[1] ? regex_results[1].toString().trim() : null;
        const doc_header = regex_results[2] ? regex_results[2] : null;
        const doc_body_open_tag = regex_results[3] ? regex_results[3] : null;
        if (!doc_beginning || !doc_header || !doc_body_open_tag) {
            throw `Original index.html is malformed and cannot be parsed anymore!`;
        }
        return `${self._removeWhiteSpacesBetweenLines(doc_beginning)}
${self._removeWhiteSpacesBetweenLines(doc_header)}
<script type="text/javascript" src="${self.paths.dist_index_minified_js}"></script>
<link rel="stylesheet" href="${self.paths.dist_index_minified_css}">
</head>
${doc_body_open_tag}
</body>
</html>`;
    }

    static _removeWhiteSpacesBetweenLines(text) {
        return text.trim().split("\n").map((line) => {
            return line.trim();
        }).join("\n");
    }
}

SipaCliBuild.SECTIONS = {};
SipaCliBuild.SECTIONS.build = [
    {
        header: 'Make production build',
        content: [
            'Your app is ready to published?',
            '',
            "It's time to put all javascript and styles together, each in one file. Then minify them."
        ]
    }
];
SipaCliBuild.SECTIONS.unresolved_files = [
    {
        header: 'Unresolved project files',
        content: [
            `{red Found {{count}} unresolved file(s) inside the project!}`,
            '',
            `Run {green sipa indexer} to resolve project files before running {green build} task!`
        ]
    }
];

SipaCliBuild.paths = {
    app_base_dir: SipaCliTools.projectRootPath() + '/app',
    dist_base_dir: SipaCliTools.projectRootPath() + '/dist/default',
    dist_index_minified_js: 'assets/js/sipa.min.js',
    dist_index_minified_css: 'assets/style/sipa.min.css',
    static_files_to_copy: {
        'assets/files': 'assets/files',
        'assets/img': 'assets/img',
    }
}

/**
 * group 1 - part at the beginning until including <head>, e.g. <!DOCTYPE html><html><head>
 * group 2 - header contents between HEADER and /HEADER
 * group 3 - body open tag including attributes
 * @type {RegExp}
 */
SipaCliBuild.ORIGINAL_INDEX_SOURCES_REGEXP = /(.*)<![-]+[=]+\s*HEADER\s*[=]+[-]+>$(.*)<![-]+[=]+\s*\/HEADER\s*[=]+[-]+>.*(<body[^\n]*>$)/gms




module.exports = SipaCliBuild;