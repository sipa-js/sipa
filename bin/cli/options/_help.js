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

    static unknown(option) {
        const self = SimparticCliHelp;
        let section = self.SECTIONS.unknown;
        section[0].content = section[0].content.replace('{{option}}', chalk.red(option));
        section = SimparticCliTools.colorizeValues(section, ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }
}

SimparticCliHelp.SECTIONS = {};
SimparticCliHelp.SECTIONS.help = [
    {
        header: 'Simpartic CLI',
        content: `The Simpartic CLI provides several interactive options to ensure programmers happiness. 😊`
    },
    {
        header: 'Usage',
        content: `Use either the full length command ${chalk.green('simpartic')} or its shortcut ${chalk.green('sipa')}.`
    },
    {
        content: [
            {name: 'simpartic <option>', summary: 'Using the full length command'},
            {name: 'sipa <option>', summary: 'Using the shortcut command'},
        ]
    },
    {
        header: 'Available options',
        content: 'Use either the full length option or its one character shortcut.'
    },
    {
        content: [
            {name: 'about', alias: 'a', summary: 'About Simpartic'},
            {name: 'build', alias: 'b', summary: 'Build release'},
            {name: 'generate', alias: 'g', summary: 'Start interactive asset generator (page, ...)'},
            {name: 'help', alias: 'h', summary: 'Print this usage guide'},
            {name: 'license', alias: 'l', summary: 'Print the license'},
            {name: 'new', alias: 'n', summary: 'Create new project in current directory'},
            {name: 'start', alias: 's', summary: 'Start live development server'},
            {name: 'update', alias: 'u', summary: 'Check for updates'},
        ]
    },
    {
        header: 'Examples',
        content: [
            {
                example: 'sipa generate',
                desc: 'Shortcut command, full length option'
            },
            {
                example: 'sipa h',
                desc: 'Shortcut command and option'
            },
            {
                example: 'simpartic new',
                desc: 'Full length command and option'
            },
            {
                example: 'simpartic b',
                desc: 'Full length command, shortcut option'
            }
        ]
    }
];

SimparticCliHelp.SECTIONS.unknown = [
    {
        header: 'Invalid option',
        content: `The given option {{option}} is invalid. Run the command with option ${chalk.green('help')} to get information about valid command line options.`
    }
];

module.exports = SimparticCliHelp;