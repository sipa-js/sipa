#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./_tools');

class SimparticCliHelp {
    static help(command_list) {
        const self = SimparticCliHelp;
        if (command_list && (command_list[0] === 'help' || command_list[0] === 'h')) {
            command_list.shift();
        } else if (command_list && command_list.length !== 0) {
            throw `Invalid help command parameter!`;
        }
        let command = command_list ? command_list[0] || 'help' : 'help';
        if (!self._isValidSection(command)) {
            command = 'help';
        }
        let section = SimparticCliTools._colorize(self.SECTIONS[command], ['name', 'alias', 'example'], 'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }

    static _isValidSection(section) {
        const self = SimparticCliHelp;
        return typeof self.SECTIONS[section] !== 'undefined';
    }
}

SimparticCliHelp.SECTIONS = {};
SimparticCliHelp.SECTIONS.help = [
    {
        header: 'Simpartic CLI',
        content: `The Simpartic CLI provides several interactive commands to ensure programmers happiness. 
        
                  You can either use the full command ${chalk.green('simpartic')} or use its shortcut ${chalk.green('sipa')} to run the CLI.`
    },
    {
        header: 'Usage',
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
            {name: 'new', alias: 'n', summary: 'Create new project in current directory'},
            {name: 'start', alias: 's', summary: 'Start live development server'},
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

module.exports = SimparticCliHelp;