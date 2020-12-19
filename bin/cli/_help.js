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
        let section = SimparticCliTools._colorize(self.SECTIONS[command],['name','alias','example'],'green');
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
        content: 'The Simpartic cli provides several interactive commands for programmers happiness.'
    },
    {
        header: 'Available commands',
        content: [
            {name: 'about', alias: 'a', summary: 'About Simpartic'},
            {name: 'build', alias: 'b', summary: 'Build release'},
            {name: 'generate', alias: 'g', summary: 'Start interactive asset generator (page, ...)'},
            {name: 'help', alias: 'h', summary: 'Print this usage page'},
            {name: 'new', alias: 'n', summary: 'Create new project in current directory'},
            {name: 'start', alias: 's', summary: 'Start live development server'},
        ]
    },
    {
        header: 'Examples',
        content: [
            {
                example: '$ sipa generate',
                desc: 'Start interactive asset generator'
            },
            {
                example: '$ sipa h',
                desc: 'Print this usage guide'
            }
        ]
    }
];

module.exports = SimparticCliHelp;