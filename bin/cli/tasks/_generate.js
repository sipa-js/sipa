#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const tools = require('./../_tools');
const fs = require('fs-extra');
const LuckyCase = require('lucky-case/string');
const glob = require('glob');
const CurlyBracketParser = require('curly-bracket-parser');
const SimparticCliTools = require('./../_tools');

const SipaHelper = require('./../../../src/simpartic/tools/sipa-helper');

class SimparticCliGenerate {
    static generate() {
        const self = SimparticCliGenerate;
        if (!SimparticCliTools.isRunningInsideValidSimparticProject()) {
            SimparticCliTools.errorNotInsideValidSimparticProject();
            return;
        }
        let section = tools.colorizeValues(self.SECTIONS.generate_overview, ['desc', 'name', 'alias'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
        const valid_options = [
            'page', 'p', 'layout', 'l', 'style', 's', 'javascript', 'j'
        ];
        const choice = tools.cliQuestion('Make your choice', valid_options, 'page', true);
        switch (choice) {
            case 'page':
            case 'p':
                self._generatePage();
                break;
            case 'layout':
            case 'l':
                self._generateLayout();
                break;
            case 'style':
            case 's':
                self._generateStyle();
                break;
            case 'javascript':
            case 'j':
                self._generateJavascript();
                break;
        }
        console.log(commandLineUsage(self.SECTIONS.generate_created));
    }

    static _generatePage() {
        const self = SimparticCliGenerate;
        const project_dir = SimparticCliTools.projectRootPath();
        // list existing pages
        const page_prefix = "app/views/pages/"
        const dirs = glob.sync(project_dir + "/app/views/pages/**/*.js", {});
        console.log(commandLineUsage(self.SECTIONS.generate_example_pages));
        console.log(commandLineUsage(self.SECTIONS.generate_existing_pages));
        let existing_pages = [];
        dirs.forEach((dir) => {
            let relative_dir = dir;
            if (relative_dir.indexOf(page_prefix) !== -1) {
                relative_dir = relative_dir.split(page_prefix)[1];
                relative_dir = relative_dir.substr(0, relative_dir.lastIndexOf('/'));
                existing_pages.push(relative_dir);
                console.log('  → ' + relative_dir.split('/').map((e) => {
                    return chalk.green(e);
                }).join('/'));
            }
        });
        existing_pages = existing_pages.sort();
        console.log();
        let page_input = null;
        while (true) {
            page_input = tools.cliQuestion('Enter the id of the new page', null, null, true).trim();
            if (existing_pages.includes(page_input)) {
                console.log(chalk.red(`  There is already a page with id '${page_input}'`));
            } else {
                break;
            }
        }
        let page_id = CurlyBracketParser._replaceAll(page_input, "\\", '/').split('/').map((e) => {
            return LuckyCase.toDashCase(e);
        }).join('/');
        page_id = SipaHelper.cutLeadingCharacters(page_id, '/');
        page_id = SipaHelper.cutTrailingCharacters(page_id, '/');
        console.log(commandLineUsage(self.SECTIONS.generate_generate));
        const final_page_dir = SimparticCliTools.projectRootPath() + '/app/views/pages/' + page_id;
        fs.mkdirSync(final_page_dir, {recursive: true});
        tools.printLine(`Generate new ${chalk.green('page')} by default page template ...`);
        tools.printLine();
        const template_src = tools.simparticRootPath() + '/lib/templates/page/default';
        fs.copySync(template_src, final_page_dir);
        const page_files = glob.sync(final_page_dir + '/*.*', {});
        const page_id_last_segment = page_id.substr(page_id.lastIndexOf('/') + 1);
        const page_class = LuckyCase.toPascalCase(CurlyBracketParser._replaceAll(page_id, '/', '_'));
        page_files.forEach((file) => {
            const file_ext = file.substr(file.lastIndexOf('.'));
            const page_dir = file.substr(0, file.lastIndexOf('/'));
            const page_id_file_name = page_id_last_segment + file_ext;
            CurlyBracketParser.parseFileWrite(file, {
                page_id: page_id,
                page_class: page_class,
                page_id_last_segment: page_id_last_segment
            });
            fs.renameSync(file, page_dir + '/' + page_id_file_name);
        });
        tools.printLine(chalk.green(page_id));
        // modify index.html
        console.log(commandLineUsage(self.SECTIONS.generate_include));
        console.log(chalk.red('NOT IMPLEMENTED YET'));
        console.log(`  ${chalk.green('done')}`);
    }

    static _generateLayout() {

    }

    static _generateStyle() {

    }

    static _generateJavascript() {

    }
}

SimparticCliGenerate.SECTIONS = {};
SimparticCliGenerate.SECTIONS.generate_overview = [
    {
        header: 'Generate project asset',
        content: [
            'Welcome to the generator to create new assets for your project! 📦',
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
SimparticCliGenerate.SECTIONS.generate_example_pages = [
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
SimparticCliGenerate.SECTIONS.generate_existing_pages = [
    {
        header: 'Existing pages',
        content: [
            'An overview about the existing pages (ids) to make the choice for a new page id easier.',
        ]
    }
];
SimparticCliGenerate.SECTIONS.generate_generate = [
    {
        header: 'Generating ...'
    }
];
SimparticCliGenerate.SECTIONS.generate_include = [
    {
        header: 'Include assets to project',
        content: [
            'Adding your assets to {green index.html} ...',
        ]
    }
];
SimparticCliGenerate.SECTIONS.generate_created = [
    {
        header: 'Finished!',
        content: [
            'Your assets have been successfully generated and added to your project!',
            '',
            'All done 🧞️ ... 📦!',
        ]
    }
];

module.exports = SimparticCliGenerate;