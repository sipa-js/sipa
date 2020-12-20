#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const chalk = require('chalk');
const SimparticCliTools = require('./_tools');

const optionDefinitions = [
    { name: 'command', type: String, multiple: true, defaultOption: true },
    { name: 'version', alias: 'v', type: Boolean },
    { name: 'about', alias: 'a', type: Boolean },
    { name: 'license', alias: 'l', type: Boolean }
]

const options = commandLineArgs(optionDefinitions, { partial: true });

console.log(SimparticCliTools.logo());

//
// help
//
if(!options.command || options.command && (options.command.includes('help') || options.command.includes('h'))) {
    const SimparticCliHelp = require('./options/_help');
    SimparticCliHelp.help();
}

//
// about
//
if(options.command || options.version || options.about) {
    if(options.version || options.about || options.command.includes('about') || options.command.includes('a') || options.command.includes('version') || options.command.includes('v')) {
        const SimparticCliAbout = require('./options/_about');
        SimparticCliAbout.about();
    }
}

//
// license
//
if(options.command || options.license) {
    if(options.license || options.command.includes('license') || options.command.includes('l')) {
        const SimparticCliLicense = require('./options/_license');
        SimparticCliLicense.license();
    }
}

console.log(options);