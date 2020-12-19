#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const chalk = require('chalk');

const optionDefinitions = [
    { name: 'command', type: String, multiple: true, defaultOption: true },
    { name: 'verbose', alias: 'v', type: Boolean },
    { name: 'timeout', alias: 't', type: Number }
]

const options = commandLineArgs(optionDefinitions)

// ASCII-Font: Calvin S
const logo = chalk.yellow(`                                  
   ┌─┐ ┬ ┌┬┐ ┌─┐ ┌─┐ ┬─┐ ┌┬┐ ┬ ┌─┐
   └─┐ │ │││ ├─┘ ├─┤ ├┬┘  │  │ │  
   └─┘ ┴ ┴ ┴ ┴   ┴ ┴ ┴└─  ┴  ┴ └─┘
   Partycular simple web framework                                                                                                                     
`);

console.log(logo);
console.log(options);

if(!options.command) {
    let a = require('./help');
}