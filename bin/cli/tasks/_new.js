#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const fs = require('fs-extra');
const glob = require('glob');
const LuckyCase = require('lucky-case/string');
const CurlyBracketParser = require('curly-bracket-parser');

const SipaCliTools = require('./../_tools');
const SipaCliOptions = require('./../_cli-options');

class SipaCliNew {
    static optionDefinitions() {
        return [
            { name: 'type', type: String, description: 'Project type: desktop or mobile' },
            { name: 'name', type: String, description: 'Project name' },
            { name: 'version', type: String, description: 'Initial version' },
            { name: 'author', type: String, description: 'Author name' },
            { name: 'email', type: String, description: 'Author email' },
            { name: 'help', type: Boolean, description: 'Show help' },
        ];
    }

    static run(argv) {
        const self = SipaCliNew;
        const args = SipaCliOptions.parse(self.optionDefinitions(), argv);
        if (args.help) {
            console.log(commandLineUsage(self.SECTIONS.new_help));
            return;
        }
        let section = SipaCliTools.colorizeValues(self.SECTIONS.new_begin, ['desc'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
        self._enterVariables(args);
        self._createProjectStructure();
    }

    static _enterVariables(args = {}) {
        const self = SipaCliNew;
        const options = ['desktop', 'mobile'];
        let project_type = args.type;
        if (project_type && !options.includes(project_type)) {
            console.log(chalk.red(`  Invalid project type '${project_type}'. Valid options: ${options.join(', ')}`));
            process.exit(1);
        }
        if (!project_type) {
            let section = SipaCliTools.colorizeValues(self.SECTIONS.new_types, ['desc'], 'green');
            console.log(commandLineUsage(section));
            project_type = SipaCliTools.cliQuestion(`Please choose your project type (${options.join(",")})`, options, 'desktop', true);
        }
        self.project_type = project_type;

        let project_name = args.name;
        if (project_name) {
            const project_dir = process.cwd() + '/' + LuckyCase.toDashCase(project_name);
            if (fs.existsSync(project_dir)) {
                console.log(chalk.red(`  Invalid project name '${project_name}'. There is already a directory '${LuckyCase.toDashCase(project_name)}'.`));
                process.exit(1);
            }
        } else {
            while (true) {
                project_name = SipaCliTools.cliQuestion('Please enter your project name', null, null, true);
                const project_dir = process.cwd() + '/' + LuckyCase.toDashCase(project_name);
                if (fs.existsSync(project_dir)) {
                    console.log(chalk.red(`  Invalid project name '${project_name}'. There is already a directory '${LuckyCase.toDashCase(project_name)}'.`));
                } else {
                    break;
                }
            }
        }
        self.options.project_name = project_name;
        self.options.project_version = args.version || SipaCliTools.cliQuestion('Please enter your initial project version', null, self.options.project_version);
        self.options.author = args.author || SipaCliTools.cliQuestion('Please enter your project author name', null, '');
        self.options.email = args.email || SipaCliTools.cliQuestion('Please enter your project author email address', null, '');
    }

    static _createProjectStructure() {
        const self = SipaCliNew;
        let section = SipaCliTools.colorizeValues(self.SECTIONS.new_create, ['desc'], 'green');
        let usage = commandLineUsage(section);
        console.log(usage);
        // create project dir
        const project_dir = process.cwd() + '/' + LuckyCase.toDashCase(self.options.project_name);
        SipaCliTools.print(`Creating project dir ...`);
        if (!fs.existsSync(project_dir)) {
            fs.mkdirSync(project_dir);
        }
        SipaCliTools.printLine(chalk.green(project_dir));
        SipaCliTools.printLine();
        // copy project template
        SipaCliTools.print(`Copying default project template ...`);
        const template_src = SipaCliTools.sipaRootPath() + '/lib/templates/project/' + self.project_type;
        fs.copySync(template_src, project_dir);
        SipaCliTools.printLine(chalk.green('done'));
        // fit project files
        SipaCliTools.printLine();
        SipaCliTools.print(`Fitting project template ...`);
        const package_json = {
            name: LuckyCase.toDashCase(self.options.project_name),
            description: self.options.project_name,
            version: self.options.project_version,
            author: {name: self.options.author, email: self.options.email},
            scripts: {
                "test": "npm run test:karma",
                "test:watch": "npm run test:karma:watch",
                "test:prepare": "node bin/jasmine/prepare-jasmine-browser.js",
                "test:karma": "karma start --single-run",
                "test:karma:dist": "karma start karma.conf.dist.js --single-run",
                "test:karma:watch": "karma start --no-single-run --auto-watch",
            },
            devDependencies: {
                "karma": "^6.4.4",
                "karma-chrome-launcher": "^3.2.0",
                "karma-jasmine": "^5.1.0",
                "ruby-nice": "^0.3.3",
                "sipa": "^0.9.37"
            }
        };
        const final_json = JSON.stringify(package_json, null, 2);
        SipaCliTools.writeFile(project_dir + '/package.json', final_json);
        // replace vars in files
        const file_variables = {
            version: package_json.version,
            project_name: package_json.name,
            description: package_json.description,
            author: package_json.author?.name,
        }
        glob.sync(project_dir + "/**/*", {nodir: true}).forEach((file) => {
            CurlyBracketParser.parseFileWrite(file, file_variables, {unresolved_vars: 'keep'});
        });
        SipaCliTools.printLine(chalk.green('done'));
        // final message
        section = SipaCliTools.colorizeValues(self.SECTIONS.new_ready, ['desc'], 'green');
        usage = commandLineUsage(section);
        console.log(usage);
    }
}

SipaCliNew.options = {
    project_name: null,
    project_version: '0.0.1',
    author: null
};

SipaCliNew.SECTIONS = {};
SipaCliNew.SECTIONS.new_begin = [
    {
        header: 'Create new project',
        content: [
            'Welcome to the project wizard to create a new Sipa project! 🧙',
            'Answer the questions wisely!',
            '',
            "Let's get started ..."
        ]
    }
];
SipaCliNew.SECTIONS.new_create = [
    {
        header: 'Creating project ...'
    }
];
SipaCliNew.SECTIONS.new_ready = [
    {
        header: 'Ready to start!',
        content: [
            `Hey, your basic project has been created, it's time to have fun again! 🎁`,
            '',
            `If you have no idea how to get started, read the documentation 📄 at {underline.blue https://github.com/sipa-js/sipa#readme}`,
            '',
            "And don't forget to tell one person today, that you love him or her! ❤️",
            '',
            "To start and run your development live web server {green cd} into your project directory and then run {green sipa server} or its shortcut {green sipa s}!"
        ]
    }
];
SipaCliNew.SECTIONS.new_types = [
    {
        header: 'Choose your project type!',
        content: [
            `Hey, you have the choice between {green desktop} and {green mobile} development!`,
            '',
            `When choosing '{green mobile}', your project will be created with a adjusted project template optimized and especially forged for and based on OnsenUI. {underline.blue https://onsen.io}`,
            '',
            "When choosing '{green desktop}', your project will be created with basic example to create web applications! Then you can add your CSS framework of choice later! In doubt, choose '{green desktop}'!",
        ]
    }
];
SipaCliNew.SECTIONS.new_help = [
    {
        header: 'sipa new',
        content: 'Create a new Sipa project.'
    },
    {
        header: 'Options',
        optionList: [
            { name: 'type', typeLabel: '{underline String}', description: 'Project type: desktop or mobile' },
            { name: 'name', typeLabel: '{underline String}', description: 'Project name' },
            { name: 'version', typeLabel: '{underline String}', description: 'Initial version' },
            { name: 'author', typeLabel: '{underline String}', description: 'Author name' },
            { name: 'email', typeLabel: '{underline String}', description: 'Author email' }
        ]
    }
];

module.exports = SipaCliNew;
