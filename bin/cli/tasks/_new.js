#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const tools = require('./../_tools');
const fs = require('fs-extra');
const LuckyCase = require('lucky-case/string');
const glob = require('glob');
const CurlyBracketParser = require('curly-bracket-parser');

class SimparticCliNew {
    static new() {
        const self = SimparticCliNew;
        let section = tools.colorizeValues(self.SECTIONS.new_begin, ['desc'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
        self._enterVariables();
        self._createProjectStructure();
    }

    static _enterVariables() {
        const self = SimparticCliNew;
        self.options.project_name = tools.cliQuestion('Please enter your project name', null, null, true);
        self.options.project_version = tools.cliQuestion('Please enter your initial project version', null, self.options.project_version);
        self.options.author = tools.cliQuestion('Please enter your project author name', null, '');
        self.options.email = tools.cliQuestion('Please enter your project author email address', null, '');
    }

    static _createProjectStructure() {
        const self = SimparticCliNew;
        let section = tools.colorizeValues(self.SECTIONS.new_create, ['desc'], 'green');
        let usage = commandLineUsage(section);
        console.log(usage);
        // create project dir
        const project_dir = process.cwd() + '/' + self.options.project_name.toDashCase();
        tools.print(`Creating project dir ...`);
        if (!fs.existsSync(project_dir)) {
            fs.mkdirSync(project_dir);
        }
        tools.printLine(chalk.green(project_dir));
        tools.printLine();
        // copy project template
        tools.print(`Copying default project template ...`);
        const template_src = tools.simparticRootPath() + '/lib/templates/project/default';
        fs.copySync(template_src, project_dir);
        tools.printLine(chalk.green('done'));
        // fit project files
        tools.printLine();
        tools.print(`Fitting project template ...`);
        const package_json = {
            name: LuckyCase.toDashCase(self.options.project_name),
            description: self.options.project_name,
            version: self.options.project_version,
            author: { name: self.options.author, email: self.options.email }
        };
        const final_json = JSON.stringify(package_json, null, 2);
        fs.writeFileSync(project_dir + '/package.json', final_json);
        // replace vars in files
        const file_variables = {
            version: package_json.version,
            project_name: package_json.name,
        }
        glob(project_dir + "/**/*", options, function (er, files) {
            files.forEach((file) => {
                CurlyBracketParser.parseFileWrite(file,file_variables);
            });
        });
        tools.printLine(chalk.green('done'));
        // final message
        section = tools.colorizeValues(self.SECTIONS.new_ready, ['desc'], 'green');
        usage = commandLineUsage(section);
        console.log(usage);
    }
}

SimparticCliNew.options = {
    project_name: null,
    project_version: '0.0.1',
    author: null
};

SimparticCliNew.SECTIONS = {};
SimparticCliNew.SECTIONS.new_begin = [
    {
        header: 'Create new project',
        content: [
            'Welcome to the project wizard to create a new Simpartic project! 🧙',
            'Answer the questions wisely!',
            '',
            'Suggestions made within [' + chalk.yellow('brackets') + '] can be applied by just pressing ENTER.'
        ]
    },
    {
        header: "Let's get started ...",
    }
];
SimparticCliNew.SECTIONS.new_create = [
    {
        header: 'Creating project ...'
    }
];
SimparticCliNew.SECTIONS.new_ready = [
    {
        header: 'Ready to start!',
        content: [
            `Hey, your basic project has been created, it's time to have fun again! 🎁`,
            '',
            `If you have no idea how to get started, read the documentation 📄 at {underline.blue https://github.com/magynhard/simpartic#readme}`,
            '',
            "And don't forget to tell one person today, that you love him or her! ❤️",
            '',
            "To start and run your development live web server {green cd} into your project dir and then run {green simpartic server} or only its shortcut {green sipa s}!"
        ]
    }
];

module.exports = SimparticCliNew;