#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SipaCliTools = require('./../_tools');

class SipaCliHelp {
    static help() {
        const self = SipaCliHelp;
        let section = SipaCliTools.colorizeValues(self.SECTIONS.help, ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
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
        header: 'Simpartic CLI',
        content: `The Simpartic CLI (sipa) provides several interactive tasks to ensure programmers happiness. 😊`
    },
    {
        header: 'Available tasks',
        content: 'Use either the full length task or its one character shortcut.'
    },
    {
        content: [
            {name: 'about', alias: 'a', summary: 'About Simpartic'},
            {name: 'build', alias: 'b', summary: 'Build app release'},
            {name: 'delete', alias: 'd', summary: 'Start interactive app asset deletion (page, ...)'},
            {name: 'generate', alias: 'g', summary: 'Start interactive app asset generator (page, ...)'},
            {name: 'help', alias: 'h', summary: 'Print this usage guide'},
            {name: 'indexer', alias: 'i', summary: 'Start interactive indexer tool'},
            {name: 'license', alias: 'l', summary: 'Print the license'},
            {name: 'new', alias: 'n', summary: 'Create new project in current directory'},
            {name: 'server', alias: 's', summary: 'Start live development server'},
            {name: 'update', alias: 'u', summary: 'Check for Simpartic updates'},
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