#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const fs = require('fs-extra');
const glob = require('glob');
const LuckyCase = require('lucky-case/string');
const CurlyBracketParser = require('curly-bracket-parser');

const SipaCliTools = require('./../_tools');
const SipaIndexManager = require('./../_index-manager');
const SipaHelper = require('./../../../src/simpartic/tools/sipa-helper');
const SipaPage = require('./../../../src/simpartic/tools/sipa-page');

class SipaCliGenerate {
    static generate() {
        const self = SipaCliGenerate;
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        let section = SipaCliTools.colorizeValues(self.SECTIONS.generate_overview, ['desc', 'name', 'alias'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
        const valid_options = [
            'page', 'p', 'layout', 'l', 'style', 's', 'javascript', 'j'
        ];
        const choice = SipaCliTools.cliQuestion('Make your choice', valid_options, 'page', true);
        switch (choice) {
            case 'page':
            case 'p':
                self._generateView({ type: 'page'});
                break;
            case 'layout':
            case 'l':
                self._generateView({ type: 'layout'});
                break;
            case 'style':
            case 's':
                self._generateAsset({ type: 'style', prefix: 'app/assets/style/'});
                break;
            case 'javascript':
            case 'j':
                self._generateAsset({ type: 'javascript', prefix: 'app/assets/js/'});
                break;
        }
        console.log(commandLineUsage(self.SECTIONS.generate_created));
    }

    /**
     * Generate new view (page or layout)
     * @param {Object} options
     * @param {('page','layout')} options.type='page'
     * @private
     */
    static _generateView(options = { type: 'page'}) {
        const self = SipaCliGenerate;
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const singular_type = LuckyCase.toLowerCase(options.type);
        const plural_type = singular_type + 's';
        const project_dir = SipaCliTools.projectRootPath();
        // list existing pages
        console.log(commandLineUsage(self.SECTIONS['generate_example_' + plural_type]));
        console.log(commandLineUsage(self.SECTIONS['generate_existing_' + plural_type]));
        let existing_views = self._listExistingFilesOrDirs(project_dir + `/app/views/${plural_type}/**/*.js`, { prefix: `app/views/${plural_type}/`, cut_file_names: true, print_paths: true });
        console.log();
        let view_input = self._prompt(`${singular_type} id`, existing_views);
        let view_id = CurlyBracketParser._replaceAll(view_input, "\\", '/').split('/').map((e) => {
            return LuckyCase.toDashCase(e);
        }).join('/');
        view_id = SipaHelper.cutLeadingCharacters(view_id, '/');
        view_id = SipaHelper.cutTrailingCharacters(view_id, '/');
        console.log(commandLineUsage(self.SECTIONS.generate_generate));
        const final_page_dir = SipaCliTools.projectRootPath() + `/app/views/${plural_type}/` + view_id;
        fs.mkdirSync(final_page_dir, {recursive: true});
        SipaCliTools.printLine(`Generate new ${chalk.green(singular_type)} by default ${singular_type} template ...`);
        SipaCliTools.printLine();
        const template_src = SipaCliTools.sipaRootPath() + `/lib/templates/${singular_type}/default`;
        fs.copySync(template_src, final_page_dir);
        const view_files = glob.sync(final_page_dir + '/*.*', {});
        const view_id_last_segment = view_id.substr(view_id.lastIndexOf('/') + 1);
        view_files.forEach((file) => {
            const file_ext = file.substr(file.lastIndexOf('.'));
            const view_dir = file.substr(0, file.lastIndexOf('/'));
            const view_id_file_name = view_id_last_segment + file_ext;
            CurlyBracketParser.parseFileWrite(file, {
                id: view_id,
                class: SipaPage.getClassNameOfTemplate(view_id, { type: singular_type}),
                id_last_segment: view_id_last_segment,
                plural_type: plural_type,
                project_name: SipaCliTools.projectName()
            });
            fs.renameSync(file, view_dir + '/' + view_id_file_name);
        });
        SipaCliTools.printLine(chalk.green(view_id));
        // modify index.html
        console.log(commandLineUsage(self.SECTIONS.generate_include));
        SipaIndexManager.appendEntry(LuckyCase.toUpperCase(`${singular_type}-JS`),final_page_dir + '/' + view_id_last_segment + '.js');
        SipaIndexManager.appendEntry(LuckyCase.toUpperCase(`${singular_type}-CSS`),final_page_dir + '/' + view_id_last_segment + '.css');
        console.log(`  ${chalk.green('done')}`);
    }

    /**
     * Generate asset of type javascript or style
     *
     * @param {Object} options
     * @param {('javascript','style')} options.type='javascript' type to generate asset for
     * @param {('app/assets/js/','app/assets/style/')} options.prefix
     * @private
     */
    static _generateAsset(options = { type: 'javascript', prefix: 'app/assets/js/'}) {
        const self = SipaCliGenerate;
        const default_options = {
          type: 'javascript',
          prefix: 'app/assets/js'
        };
        options = SipaHelper.mergeOptions(default_options, options);
        const asset_name = `${options.type} asset`;
        console.log(commandLineUsage(self.SECTIONS['generate_example_' + options.type]));
        console.log(commandLineUsage(self.SECTIONS['generate_existing_' + options.type]));
        const project_dir = SipaCliTools.projectRootPath();
        let asset_ext = null;
        if(options.type === 'javascript') {
            asset_ext = 'js';
        } else if(options.type === 'style') {
            asset_ext = 'css';
        } else {
            throw `Unknown type '${options.type}'`;
        }
        let existing_views = self._listExistingFilesOrDirs(project_dir + `/${options.prefix}**/*.${asset_ext}`, { prefix: options.prefix, cut_file_names: false, cut_file_extensions: true, print_paths: true });
        console.log();
        let input = self._prompt(asset_name, existing_views);
        let asset_id = CurlyBracketParser._replaceAll(input, "\\", '/').split('/').map((e) => {
            return LuckyCase.toDashCase(e);
        }).join('/');
        asset_id = SipaHelper.cutLeadingCharacters(asset_id, '/');
        asset_id = SipaHelper.cutTrailingCharacters(asset_id, '/');
        console.log(commandLineUsage(self.SECTIONS.generate_generate));
        let final_asset_dir = SipaCliTools.projectRootPath() + `/${options.prefix}`;
        if(asset_id.indexOf('/') !== -1) {
            final_asset_dir += asset_id.substring(0,asset_id.lastIndexOf('/')+1);
        }
        let asset_id_last_segment = asset_id;
        if(asset_id.indexOf('/') !== -1) {
            asset_id_last_segment = asset_id_last_segment.substr(asset_id_last_segment.lastIndexOf('/')+1);
        }
        fs.mkdirSync(final_asset_dir, {recursive: true});
        SipaCliTools.printLine(`Generate new ${chalk.green(asset_name)} by default ${asset_name} template ...`);
        SipaCliTools.printLine();
        const template_src = SipaCliTools.sipaRootPath() + `/lib/templates/assets/default/${options.type}`;
        fs.copySync(template_src, final_asset_dir);
        const asset_files = glob.sync(template_src + '/*.*', {}).map((e) => { return final_asset_dir + e.substr(e.lastIndexOf('/')); });
        asset_files.forEach((file) => {
            const file_ext = file.substr(file.lastIndexOf('.'));
            const asset_dir = file.substr(0, file.lastIndexOf('/'));
            const asset_file_name = LuckyCase.toDashCase(asset_id_last_segment) + file_ext;
            CurlyBracketParser.parseFileWrite(file, {
                class: LuckyCase.toPascalCase(asset_file_name.substring(0,asset_file_name.lastIndexOf('.'))),
            });
            fs.renameSync(file, asset_dir + '/' + asset_file_name);
        });
        SipaCliTools.printLine(chalk.green(asset_id));
        // modify index.html
        console.log(commandLineUsage(self.SECTIONS.generate_include));
        if(options.type === 'javascript') {
            SipaIndexManager.appendEntry(LuckyCase.toUpperCase(`ASSET-JS`),final_asset_dir + asset_id_last_segment + '.js');
        } else if(options.type === 'style') {
            SipaIndexManager.appendEntry(LuckyCase.toUpperCase(`ASSET-CSS`),final_asset_dir + asset_id_last_segment + '.css');
        } else {
            throw `Unknown type '${options.type}'`;
        }
        console.log(`  ${chalk.green('done')}`);
    }

    /**
     * List existing files or directories by given pattern
     *
     * @param {string} dir_pattern, e.g. '/my/path/*.ext', '/my/path/**'
     * @param {Object} options
     * @param {boolean} options.cut_file_names=false cut the file name including slash at the end, e.g. /file.ext
     * @param {boolean} options.cut_file_extensions=false cut file extensions at the end, e.g. .ext
     * @param {boolean} options.print_paths=true print the files found
     * @param {string} options.prefix prefix to remove from the path, e.g. /uninteresting/prefix/path/
     * @returns {Array<string>} existing file paths
     * @private
     */
    static _listExistingFilesOrDirs(dir_pattern, options = { cut_file_names: false, cut_file_extensions: false, print_paths: true, prefix: null }) {
        const default_options = {
            cut_file_names: false,
            cut_file_extensions: false,
            print_paths: true
        };
        options = SipaHelper.mergeOptions(default_options, options);
        const dirs = glob.sync(dir_pattern, {});
        let existing_views = [];
        dirs.forEach((dir) => {
            let relative_dir = dir;
            if (relative_dir.indexOf(options.prefix) !== -1) {
                relative_dir = relative_dir.split(options.prefix)[1];
                if(options.cut_file_extensions) {
                    // cut only if it is after the last dir
                    if(relative_dir.lastIndexOf('.') > relative_dir.lastIndexOf('/')) {
                        relative_dir = relative_dir.substr(0, relative_dir.lastIndexOf('.'));
                    }
                }
                if(options.cut_file_names) {
                    relative_dir = relative_dir.substr(0, relative_dir.lastIndexOf('/'));
                }
                existing_views.push(relative_dir);
                if(options.print_paths) {
                    console.log('  → ' + relative_dir.split('/').map((e) => {
                        return chalk.green(e);
                    }).join('/'));
                }
            }
        });
        existing_views = existing_views.sort();
        return existing_views;
    }

    /**
     * Prompt for a asset name
     *
     * @param {string} asset_name
     * @param {Array<String>} existing_assets asset names that are forbidden, because they exist already
     * @returns {string} valid input
     * @private
     */
    static _prompt(asset_name, existing_assets) {
        let input = null;
        while (true) {
            input = SipaCliTools.cliQuestion(`Enter the name of the new ${asset_name}`, null, null, true).trim();
            if (existing_assets.includes(input)) {
                console.log(chalk.red(`  There is already a ${asset_name} '${input}'`));
            } else {
                break;
            }
        }
        return input;
    }
}

SipaCliGenerate.SECTIONS = {};
SipaCliGenerate.SECTIONS.generate_overview = [
    {
        header: 'Generate project asset',
        content: [
            'Welcome to the generator to create new assets for your project! 📦',
            '',
            'If you want to add existing style or javascript libraries, run the task {green indexer}.'
        ],
    },
    {
        header: 'Available generators',
        content: [
            'Use either the full length name or its one character shortcut.',
        ],
    },
    {
        content: [
            {name: 'page', alias: 'p', summary: 'Add new page asset set containing .html, .js, .css and .scss'},
            {name: 'layout', alias: 'l', summary: 'Add new layout asset set containing .html, .js, .css and .scss'},
            {name: 'style', alias: 's', summary: 'Add new global stylesheet definition set, containing .css and .scss'},
            {name: 'javascript', alias: 'j', summary: 'Add new global javascript file'},
        ]
    },
    {
        header: "Let's get started ..."
    }
];
SipaCliGenerate.SECTIONS.generate_example_pages = [
    {
        header: 'Page id format',
        content: [
            'The page id must be in lower (dash) case, and can be structured in different directories by slashes (/).',
            '',
            '{bold Examples:}',
            '  → {green settings}/{green my-account}',
            '  → {green imprint}',
            '  → {green example-pages}/{green nested-page}/{green super-example}',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_existing_pages = [
    {
        header: 'Existing page ids',
        content: [
            'An overview about the existing page ids to make the choice for the new page id easier.',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_example_layouts = [
    {
        header: 'Layout id format',
        content: [
            'The layout id must be in lower (dash) case, and can be structured in different directories by slashes (/).',
            '',
            '{bold Examples:}',
            '  → {green errors}/{green info}',
            '  → {green errors}/{green error}',
            '  → {green mini-dialog}',
            '  → {green without-top-menu}',
            '  → {green empty}',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_existing_layouts = [
    {
        header: 'Existing layout ids',
        content: [
            'An overview about the existing layout ids to make the choice for the new layout id easier.',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_example_javascript = [
    {
        header: 'Javascript asset file name format',
        content: [
            'The javascript asset file must be in lower (dash) case, and can be structured in different directories by slashes (/).',
            'File extension .js is added automatically.',
            '',
            '{bold Examples:}',
            '  → {green my-global-service}',
            '  → {green helpers}/{green my-super-helper}',
            '  → {green services}/{green hyper-service}',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_existing_javascript = [
    {
        header: 'Existing javascript assets',
        content: [
            'An overview about the existing javascript assets to make the choice for the new javascript asset name easier.',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_example_style = [
    {
        header: 'Style asset file name format',
        content: [
            'The style asset file must be in lower (dash) case, and can be structured in different directories by slashes (/).',
            'File extension .css is added automatically.',
            '',
            '{bold Examples:}',
            '  → {green internet-explorer-hacks}',
            '  → {green components}/{green my-custom-panel}',
            '  → {green modes}/{green dark-mode}',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_existing_style = [
    {
        header: 'Existing style assets',
        content: [
            'An overview about the existing style assets to make the choice for the new style asset name easier.',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_generate = [
    {
        header: 'Generating ...'
    }
];
SipaCliGenerate.SECTIONS.generate_include = [
    {
        header: 'Include assets to project',
        content: [
            'Adding your assets to {green index.html} ...',
        ]
    }
];
SipaCliGenerate.SECTIONS.generate_created = [
    {
        header: 'Finished!',
        content: [
            'Your assets have been successfully generated and added to your project!',
            '',
            'All done 🧞️ ... 📦!',
        ]
    }
];

module.exports = SipaCliGenerate;