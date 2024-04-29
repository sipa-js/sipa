#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const path = require('path');
const glob = require("glob");
const execSync = require("child_process").execSync;

const SipaCliTools = require('./../_tools');
const SipaCliServer = require('./../tasks/_server');
const SipaCliIndexManager = require('./../_index-manager');
const SipaCliVersion = require('./_version');
const File = require("ruby-nice/file");
const Dir = require('ruby-nice/dir');

class SipaCliBuild {
    static build() {
        const self = SipaCliBuild;
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        if (SipaCliIndexManager.missingFilesOrEntriesCount() > 0) {
            let section = self.SECTIONS.unresolved_files;
            section[0].content[0] = section[0].content[0].replace('{{count}}', SipaCliIndexManager.missingFilesOrEntriesCount());
            console.log(commandLineUsage(section));
            return;
        }
        console.log(commandLineUsage(self.SECTIONS.build));
        SipaCliTools.removePath(self.paths.dist_base_dir);
        SipaCliTools.makeDir(self.paths.dist_base_dir);
        self.createDistIndexHtml();
        self.updateProjectVersion();
        self.createMinifiedJsFile();
        self.createMinifiedCssFile();
        self.processFonts();
        self.copyViews();
        self.copyStaticFiles();
    }

    static createDistIndexHtml() {
        const self = SipaCliBuild;
        const target_path = self.paths.dist_base_dir + '/index.html';
        SipaCliTools.printLine(`→ building ${chalk.green('index.html')} ...`);
        SipaCliTools.writeFile(target_path, self._generateDistIndexHtml());
    }

    static updateProjectVersion() {
        const self = SipaCliBuild;
        const sipa_js_path = Dir.glob(self.paths.app_base_dir + '/**/sipa.js')[0];
        if(!sipa_js_path) {
            console.error(`Could not update project version. Could not find file 'sipa.js' in your projects app directory.`);
        }
        const package_json = self.getProjectPackageJson();
        // SipaEnv class
        let sipa_js = fs.readFileSync(sipa_js_path,'utf8');
        sipa_js = sipa_js.replace(/\"version\"\: \"[0-9]+.[0-9]+.[0-9]+\",/, `"version": "${package_json.version}",`);
        sipa_js = sipa_js.replace(/\"name\"\: \"[^\"]+\",/, `"name": "${package_json.name}",`);
        sipa_js = sipa_js.replace(/\"description\"\: \"[^\"]+\",/, `"description": "${package_json.description}",`);
        fs.writeFileSync(sipa_js_path, sipa_js, 'utf8');
        // manifest.json if available
        const version = self.getProjectPackageJson().version;
        const manifest_path = SipaCliTools.projectRootPath() + '/app/manifest.json';
        if(File.isExisting(manifest_path)) {
            let manifest_json = fs.readFileSync(manifest_path,'utf8');
            manifest_json = manifest_json.replace(/\"version\"\: \"[0-9]+.[0-9]+.[0-9]+\"/, `"version": "${version}"`);
            fs.writeFileSync(manifest_path, manifest_json, 'utf8');
        }
    }

    static getProjectPackageJson() {
        const self = SipaCliBuild;
        const package_json_path = SipaCliTools.projectRootPath() + '/package.json';
        const package_json = JSON.parse(File.read(package_json_path));
        return package_json;
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
        if(SipaCliTools.readProjectSipaConfig().build?.minify?.js?.remove_comments) {
            // remove any single line comments
            final_js_file_content = final_js_file_content.replace(/^\s*\/\/[^\n]*$/gms, '');
            // remove any multi line comments
            final_js_file_content = final_js_file_content.replace(/^\s*\/\*[^*]*\*+([^\/][^*]*\*+)*\//gms, '');
        }
        SipaCliTools.writeFile(final_file_path, final_js_file_content);
        if(SipaCliTools.readProjectSipaConfig().build?.minify?.js?.compress) {
            const green_path = chalk.green(`${final_file_path.substring(final_file_path.lastIndexOf('assets/'))}`);
            SipaCliTools.printLine(`    → minify javascript to ${green_path} ...`);
            let terser_path = null;
            const npm_path = File.expandPath(`${SipaCliTools.sipaRootPath()}/node_modules/terser/bin/terser`);
            const yarn_path = File.expandPath(`${SipaCliTools.sipaRootPath()}/../../node_modules/terser/bin/terser`);
            // npm path
            if(File.isExisting(npm_path)) {
                terser_path = npm_path;
            } // yarn path
            else if(File.isExisting((yarn_path))) {
                terser_path = yarn_path;
            } else {
                throw new Error(`Could not locate sass.js`);
            }
            const minify_command = `node "${terser_path}" "${final_file_path}" -m -c -o "${final_file_path}"`;
            // workaround for systems with bash if they are run without bin/bash shell path explicitly, e.g. Jenkins runs on /bin/sh by default
            // https://stackoverflow.com/questions/17860339/process-substitution-node-js-child-process
            let options = undefined;
            if(File.isExisting(`/bin/bash`)) {
                options = {shell: `/bin/bash`};
            }
            execSync(minify_command, options);
        }
    }

    static createMinifiedCssFile() {
        const self = SipaCliBuild;
        // compile SASS to CSS before processing
        SipaCliServer.runSass(`--update ${SipaCliServer._sassWatchPathsInline()} --no-source-map --style=compressed`, false, true);
        const index_css_files = SipaCliIndexManager.getStyleEntries();
        let final_css_file_content = "";
        SipaCliTools.printLine(`→ merge stylesheet files to minify ...`);
        index_css_files.forEach((file) => {
            SipaCliTools.printLine(`  - ${file} ... `);
            let file_content = SipaCliTools.readFile(self.paths.app_base_dir + '/' + file);
            final_css_file_content += "\n" + file_content;
        });
        if(SipaCliTools.readProjectSipaConfig().build?.minify?.css?.remove_comments) {
            // remove any multi line comments
            final_css_file_content = final_css_file_content.replace(/\/\*[^*]*\*+([^\/][^*]*\*+)*\//gms, '');
        }
        SipaCliTools.writeFile(self._finalDistCssStylePath(), final_css_file_content);
        if(SipaCliTools.readProjectSipaConfig().build?.minify?.css?.compress) {
            const green_path = chalk.green(`${self._finalDistCssStylePath().substring(self._finalDistCssStylePath().lastIndexOf('assets/'))}`);
            SipaCliTools.printLine(`    → minify css to ${green_path} ...`);
            SipaCliServer.runSass(`"${self._finalDistCssStylePath()}" --no-source-map --style=compressed "${self._finalDistCssStylePath()}"`, false, true);
        }
        // remove zero width white spaces and utf8 line breaks from css
        // https://stackoverflow.com/questions/11305797/remove-zero-width-space-characters-from-a-javascript-string
        final_css_file_content = SipaCliTools.readFile(self._finalDistCssStylePath());
        final_css_file_content = final_css_file_content.replace(/[\u200B-\u200D\uFEFF\u2028\u2029]/g, '');
        SipaCliTools.writeFile(self._finalDistCssStylePath(), final_css_file_content);
    }

    /**
     * Copies only fonts, that are used in css, to distribution directory.
     *
     * After that, paths inside CSS of copied fonts are fixed automatically, if option in config is set.
     */
    static processFonts() {
        const self = SipaCliBuild;
        const fonts_in_css = self._cssFontFilesBaseNames();
        const app_fonts_pattern = SipaCliTools.projectRootPath() + `/app/assets/**/*.{${self.supported_font_types.join(',')}}`;
        const fonts_in_app_font_folder = glob.sync(app_fonts_pattern);
        const used_fonts_in_app_folder = fonts_in_app_font_folder.filter((font) => {
            for (let i = 0; i < fonts_in_css.length; ++i) {
                if (font.endsWith(fonts_in_css[i])) return true;
            }
            return false;
        });
        SipaCliTools.printLine(`→ copy fonts used inside css ...`);
        used_fonts_in_app_folder.forEach((used_font) => {
            const dest_file = self.paths.dist_base_dir + '/' + self.paths.fonts_base_dir + '/' + path.basename(used_font);
            SipaCliTools.copyFile(used_font, dest_file);
            SipaCliTools.printLine(`  - ${chalk.green(self.paths.fonts_base_dir + '/' + path.basename(used_font))} ...`);
        });
        if(SipaCliTools.readProjectSipaConfig().build?.auto_fix_font_paths_in_css) {
            SipaCliTools.printLine(`→ auto fix font paths in css ...`);
            let css_file_content = SipaCliTools.readFile(self._finalDistCssStylePath());
            const copied_fonts = glob.sync(self.paths.dist_base_dir + '/assets/fonts/*');
            copied_fonts.forEach((font) => {
               const font_regex = new RegExp(`url\\s*\\(\\s*['"]([^\\)]+${SipaCliTools.escapeRegExp(path.basename(font))})([#?][^)]*)*['"]\\s*\\)`,'gms');
               css_file_content = css_file_content.replace(font_regex, `url("${self.paths.fonts_production_style_dir}/${path.basename(font)}` + '$2")');
            });
            SipaCliTools.writeFile(self._finalDistCssStylePath(), css_file_content);
        } else {
            SipaCliTools.printLine(`→ auto fix font paths in css ... ${chalk.red('skipped')}`);
        }
    }

    static copyViews() {
        const self = SipaCliBuild;
        SipaCliTools.printLine(`→ copy views ...`);
        const static_files_to_copy = glob.sync(self.paths.app_base_dir + '/views/**/*.html');
        static_files_to_copy.forEach((src_file, index) => {
            self.paths.app_base_dir = self.paths.app_base_dir.replace(/\\/g,'/') // ensure ms win compatibility
            const dest_relative_path = src_file.replace(self.paths.app_base_dir + '/','');
            const dest_path = self.paths.dist_base_dir + '/' + dest_relative_path;
            SipaCliTools.printLine(`  - ${chalk.green(dest_relative_path)} ...`);
            SipaCliTools.makeDirOfFile(dest_path);
            SipaCliTools.copyFile(src_file, dest_path);
        });
    }

    static copyStaticFiles() {
        const self = SipaCliBuild;
        SipaCliTools.printLine(`→ copy static files ...`);
        const static_files_to_copy = SipaCliTools.readProjectSipaConfig().build?.static_files_to_copy;
        Object.keys(static_files_to_copy).forEach((from_path, index) => {
            const to_path = static_files_to_copy[from_path];
            if(SipaCliTools.pathExists(self.paths.app_base_dir + '/' + from_path)) {
                SipaCliTools.printLine(`  - ${from_path} > ${chalk.green(to_path)} ...`);
                if(SipaCliTools.isDir(self.paths.app_base_dir + '/' + from_path)) {
                    SipaCliTools.makeDir(self.paths.dist_base_dir + '/' + to_path);
                } else if(SipaCliTools.isFile(self.paths.app_base_dir + '/' + from_path)) {
                    SipaCliTools.makeDirOfFile(self.paths.dist_base_dir + '/' + to_path);
                }
                SipaCliTools.copy(self.paths.app_base_dir + '/' + from_path, self.paths.dist_base_dir + '/' + to_path);
            } else {
                SipaCliTools.printLine(`  - ${chalk.red(from_path)} > ${to_path}`);
                throw chalk.red(`Invalid path! Path does not exist: '${self.paths.app_base_dir + '/' + from_path}'`)
            }
        });
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
        const version = self.getProjectPackageJson().version;
        return `${self._removeWhiteSpacesBetweenLines(doc_beginning)}
${self._removeWhiteSpacesBetweenLines(doc_header)}
<script type="text/javascript" src="${self.paths.dist_index_minified_js}?v=${version}"></script>
<link rel="stylesheet" href="${self.paths.dist_index_minified_css}?v=${version}">
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

    /**
     * Get all font file base names inside the final minified css file,
     * e.g. ["font.woff","myFont.ttf"]
     *
     * @returns {Array<String>}
     * @private
     */
    static _cssFontFilesBaseNames() {
        const self = SipaCliBuild;
        let css_file_content = SipaCliTools.readFile(self._finalDistCssStylePath());
        const regex = self.CSS_URL_CONTENT_REGEXP;
        regex.lastIndex = 0;
        let matches = [];
        let match = null;
        while (match = regex.exec(css_file_content)) {
            matches.push(match[1]);
        }
        regex.lastIndex = 0;
        matches = matches.map((el) => {
            if (el.indexOf('#') !== -1) el = el.substring(0, el.lastIndexOf('#')); // remove anchors
            if (el.indexOf('?') !== -1) el = el.substring(0, el.lastIndexOf('?')); // remove params
            if (['"', "'"].includes(el[0])) el = el.substring(1); // remove quotes at beginning
            if (['"', "'"].includes(el[el.length - 1])) el = el.substring(0, el.length - 1); // remove quotes at the end
            return el;
        });
        matches = matches.filter((el) => {
            for (let i = 0; i < self.supported_font_types.length; ++i) {
                if (el.endsWith("." + self.supported_font_types[i])) return true;
            }
            return false;
        });
        matches = matches.map((el) => {
            return path.basename(el);
        });
        return matches;
    }

    static _finalDistCssStylePath() {
        const self = SipaCliBuild;
        return self.paths.dist_base_dir + '/' + self.paths.dist_index_minified_css;
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
    dist_index_minified_js: 'assets/js/app.min.js',
    dist_index_minified_css: 'assets/style/app.min.css',
    fonts_base_dir: 'assets/fonts',
    fonts_production_style_dir: '../fonts',
}

SipaCliBuild.supported_font_types = ['ttf', 'woff', 'woff2', 'eot', 'otf'];

/**
 * group 1 - part at the beginning until including <head>, e.g. <!DOCTYPE html><html><head>
 * group 2 - header contents between HEADER and /HEADER
 * group 3 - body open tag including attributes
 * @type {RegExp}
 */
SipaCliBuild.ORIGINAL_INDEX_SOURCES_REGEXP = /(.*)<![-]+[=]+\s*HEADER\s*[=]+[-]+>$(.*)<![-]+[=]+\s*\/HEADER\s*[=]+[-]+>.*(<body[^\n]*>$)/gms;
SipaCliBuild.CSS_URL_CONTENT_REGEXP = /url\s*\(\s*([^\)]+)\s*\)/gms;

module.exports = SipaCliBuild;