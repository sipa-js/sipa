#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SipaCliTools = require('./../_tools');

class SipaCliHelp {
    static help(sub_command = null) {
        const self = SipaCliHelp;
        if (sub_command) {
            const task_help = self._taskHelp(sub_command);
            if (task_help) {
                console.log(commandLineUsage(task_help));
                return;
            }
        }
        let section = SipaCliTools.colorizeValues(self.SECTIONS.help, ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }

    static _taskHelp(sub_command) {
        const module_map = {
            new: './_new',
            n: './_new',
            generate: './_generate',
            g: './_generate',
            indexer: './_indexer',
            i: './_indexer',
            build: './_build',
            b: './_build',
            server: './_server',
            s: './_server',
        };
        if (!module_map[sub_command]) return null;
        const Task = require(module_map[sub_command]);
        if (typeof Task.optionDefinitions !== 'function') return null;
        const defs = Task.optionDefinitions();
        const optionList = defs.map(d => ({
            name: d.name,
            type: d.type,
            description: d.description || '',
        }));
        return [
            { header: `sipa ${sub_command}`, content: `Help for sipa ${sub_command}.` },
            { header: 'Options', optionList }
        ];
    }

    static unknown(task) {
        const self = SipaCliHelp;
        let section = self.SECTIONS.unknown;
        section[0].content = section[0].content.replace('{{task}}', chalk.red(task));
        section = SipaCliTools.colorizeValues(section, ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }
}

SipaCliHelp.SECTIONS = {};
SipaCliHelp.SECTIONS.help = [
    {
        header: 'Sipa CLI',
        content: `The Sipa CLI (sipa) provides several interactive tasks to ensure programmers happiness. 😊`
    },
    {
        header: 'Available tasks',
        content: 'Use either the full length task or its one character shortcut.'
    },
    {
        content: [
            {name: 'about', alias: 'a', summary: 'About Sipa'},
            {name: 'build', alias: 'b', summary: 'Build app release'},
            {name: 'delete', alias: 'd', summary: 'Start interactive app asset deletion (page, ...)'},
            {name: 'generate', alias: 'g', summary: 'Start interactive app asset generator (page, ...)'},
            {name: 'help', alias: 'h', summary: 'Print this usage guide'},
            {name: 'indexer', alias: 'i', summary: 'Start interactive indexer tool'},
            {name: 'license', alias: 'l', summary: 'Print the license'},
            {name: 'new', alias: 'n', summary: 'Create new project in current directory'},
            {name: 'server', alias: 's', summary: 'Start live development server'},
            {name: 'update', alias: 'u', summary: 'Check for Sipa updates'},
            {name: 'version', alias: 'v', summary: 'Display build version'},
        ]
    },
    {
        header: 'Examples',
        content: [
            {
                example: 'sipa generate',
                desc: 'Full length task, its shortcut is {green g}'
            },
            {
                example: 'sipa h',
                desc: 'Shortcut task for {green help}'
            },
        ]
    }
];

SipaCliHelp.SECTIONS.unknown = [
    {
        header: 'Invalid task',
        content: `The given task {{task}} is invalid. Run the command with task ${chalk.green('help')} to get information about valid tasks.`
    }
];

module.exports = SipaCliHelp;