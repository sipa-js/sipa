#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./../_tools');

class SimparticCliHelp {
    static help() {
        const self = SimparticCliHelp;
        let section = SimparticCliTools.colorizeValues(self.SECTIONS.help, ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }

    static unknown(task) {
        const self = SimparticCliHelp;
        let section = self.SECTIONS.unknown;
        section[0].content = section[0].content.replace('{{task}}', chalk.red(task));
        section = SimparticCliTools.colorizeValues(section, ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }
}

SimparticCliHelp.SECTIONS = {};
SimparticCliHelp.SECTIONS.help = [
    {
        header: 'Simpartic CLI',
        content: `The Simpartic CLI provides several interactive tasks to ensure programmers happiness. 😊`
    },
    {
        header: 'Usage',
        content: `Use either the full length command ${chalk.green('simpartic')} or its shortcut ${chalk.green('sipa')}.`
    },
    {
        content: [
            {name: 'simpartic <task>', summary: 'Using the full length command'},
            {name: 'sipa <task>', summary: 'Using the shortcut command'},
        ]
    },
    {
        header: 'Available tasks',
        content: 'Use either the full length task or its one character shortcut.'
    },
    {
        content: [
            {name: 'about', alias: 'a', summary: 'About Simpartic'},
            {name: 'build', alias: 'b', summary: 'Build app release'},
            {name: 'generate', alias: 'g', summary: 'Start interactive app asset generator (page, ...)'},
            {name: 'help', alias: 'h', summary: 'Print this usage guide'},
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
                desc: 'Shortcut command, full length task'
            },
            {
                example: 'sipa h',
                desc: 'Shortcut command and task'
            },
            {
                example: 'simpartic new',
                desc: 'Full length command and task'
            },
            {
                example: 'simpartic b',
                desc: 'Full length command, shortcut task'
            }
        ]
    }
];

SimparticCliHelp.SECTIONS.unknown = [
    {
        header: 'Invalid task',
        content: `The given task {{task}} is invalid. Run the command with task ${chalk.green('help')} to get information about valid tasks.`
    }
];

module.exports = SimparticCliHelp;