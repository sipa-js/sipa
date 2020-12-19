#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const chalk = require('chalk');

const optionDefinitions = [
    { name: 'command', type: String, multiple: true, defaultOption: true },
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'timeout', alias: 't', type: Number }
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

if(options.command) {
    if(options.command.includes('about') || options.command.includes('a')) {
        const SimparticCliAbout = require('./_about');
        SimparticCliAbout.about();
    }
}

console.log(options);