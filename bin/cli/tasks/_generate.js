#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const tools = require('./../_tools');
const fs = require('fs-extra');
const LuckyCase = require('lucky-case/string');
const glob = require('glob');
const CurlyBracketParser = require('curly-bracket-parser');
const SimparticCliTools = require('./../_tools');
const SimparticIndexManager = require('./../_index-manager');

const SipaHelper = require('./../../../src/simpartic/tools/sipa-helper');
const SipaPage = require('./../../../src/simpartic/tools/sipa-page');

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
                self._generateView({ type: 'page'});
                break;
            case 'layout':
            case 'l':
                self._generateView({ type: 'layout'});
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

    /**
     * Generate new view (page or layout)
     * @param {Object} options
     * @param {('page','layout')} options.type='page'
     * @private
     */
    static _generateView(options = { type: 'page'}) {
        const self = SimparticCliGenerate;
        const default_options = {
            type: 'page'
        }
        options = SipaHelper.mergeOptions(default_options, options);
        const singular_type = LuckyCase.toLowerCase(options.type);
        const plural_type = singular_type + 's';
        const project_dir = SimparticCliTools.projectRootPath();
        // list existing pages
        const page_prefix = `app/views/${plural_type}/`;
        const dirs = glob.sync(project_dir + `/app/views/${plural_type}/**/*.js`, {});
        console.log(commandLineUsage(self.SECTIONS.generate_example_pages));
        console.log(commandLineUsage(self.SECTIONS.generate_existing_pages));
        let existing_views = [];
        dirs.forEach((dir) => {
            let relative_dir = dir;
            if (relative_dir.indexOf(page_prefix) !== -1) {
                relative_dir = relative_dir.split(page_prefix)[1];
                relative_dir = relative_dir.substr(0, relative_dir.lastIndexOf('/'));
                existing_views.push(relative_dir);
                console.log('  → ' + relative_dir.split('/').map((e) => {
                    return chalk.green(e);
                }).join('/'));
            }
        });
        existing_views = existing_views.sort();
        console.log();
        let view_input = null;
        while (true) {
            view_input = tools.cliQuestion(`Enter the id of the new ${singular_type}`, null, null, true).trim();
            if (existing_views.includes(view_input)) {
                console.log(chalk.red(`  There is already a ${singular_type} with id '${view_input}'`));
            } else {
                break;
            }
        }
        let view_id = CurlyBracketParser._replaceAll(view_input, "\\", '/').split('/').map((e) => {
            return LuckyCase.toDashCase(e);
        }).join('/');
        view_id = SipaHelper.cutLeadingCharacters(view_id, '/');
        view_id = SipaHelper.cutTrailingCharacters(view_id, '/');
        console.log(commandLineUsage(self.SECTIONS.generate_generate));
        const final_page_dir = SimparticCliTools.projectRootPath() + `/app/views/${plural_type}/` + view_id;
        fs.mkdirSync(final_page_dir, {recursive: true});
        tools.printLine(`Generate new ${chalk.green(singular_type)} by default ${singular_type} template ...`);
        tools.printLine();
        const template_src = tools.simparticRootPath() + `/lib/templates/${singular_type}/default`;
        fs.copySync(template_src, final_page_dir);
        const page_files = glob.sync(final_page_dir + '/*.*', {});
        const page_id_last_segment = view_id.substr(view_id.lastIndexOf('/') + 1);
        page_files.forEach((file) => {
            const file_ext = file.substr(file.lastIndexOf('.'));
            const page_dir = file.substr(0, file.lastIndexOf('/'));
            const page_id_file_name = page_id_last_segment + file_ext;
            CurlyBracketParser.parseFileWrite(file, {
                id: view_id,
                class: SipaPage.getClassNameOfTemplate(view_id, { type: singular_type}),
                id_last_segment: page_id_last_segment,
                plural_type: plural_type,
                project_name: SimparticCliTools.projectName()
            });
            fs.renameSync(file, page_dir + '/' + page_id_file_name);
        });
        tools.printLine(chalk.green(view_id));
        // modify index.html
        console.log(commandLineUsage(self.SECTIONS.generate_include));
        SimparticIndexManager.appendEntry(LuckyCase.toUpperCase(`${singular_type}-JS`),final_page_dir + '/' + page_id_last_segment + '.js');
        SimparticIndexManager.appendEntry(LuckyCase.toUpperCase(`${singular_type}-CSS`),final_page_dir + '/' + page_id_last_segment + '.css');
        console.log(`  ${chalk.green('done')}`);
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
        header: 'Id format',
        content: [
            'The id must be in lower (dash) case, and can be structured in different directories by slashes (/).',
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
        header: 'Existing ids',
        content: [
            'An overview about the existing ids to make the choice for a new id easier.',
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