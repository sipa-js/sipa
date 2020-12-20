#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const chalk = require('chalk');

const optionDefinitions = [
    { name: 'command', type: String, multiple: true, defaultOption: true },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'about', alias: 'a', type: Boolean }
]

const options = commandLineArgs(optionDefinitions, { partial: true });

// ASCII-Font: Calvin S
const logo = chalk.yellow(`                                  
   ┌─┐ ┬ ┌┬┐ ┌─┐ ┌─┐ ┬─┐ ┌┬┐ ┬ ┌─┐
   └─┐ │ │││ ├─┘ ├─┤ ├┬┘  │  │ │  
   └─┘ ┴ ┴ ┴ ┴   ┴ ┴ ┴└─  ┴  ┴ └─┘
   Partycular simple web framework
`);

console.log(logo);

if(!options.command || options.command && (options.command.includes('help') || options.command.includes('h'))) {
    const SimparticCliHelp = require('./_help');
    SimparticCliHelp.help(options.command);
}

if(options.command || options.version || options.about) {
    if(options.version || options.about || options.command.includes('about') || options.command.includes('a') || options.command.includes('version') || options.command.includes('v')) {
        const SimparticCliAbout = require('./_about');
        SimparticCliAbout.about();
    }
}

console.log(options);