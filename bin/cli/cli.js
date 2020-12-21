#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const chalk = require('chalk');

const SimparticCliTools = require('./_tools');
const SimparticCliHelp = require('./options/_help');

const optionDefinitions = [
    {name: 'command', type: String, multiple: true, defaultOption: true},
    {name: 'version', alias: 'v', type: Boolean},
    {name: 'about', alias: 'a', type: Boolean},
    {name: 'license', alias: 'l', type: Boolean}
]

const options = commandLineArgs(optionDefinitions, {partial: true});

console.log(SimparticCliTools.logo());

//
// about / version
//
if (options.version || options.about || options.command && (options.command[0] === 'about' || options.command[0] === 'a' || options.command[0] === 'version' || options.command[0] === 'v')) {
    const SimparticCliAbout = require('./options/_about');
    SimparticCliAbout.about();
}
//
// license
//
else if (options.license || options.command && (options.command[0] === 'license' || options.command[0] === 'l')) {
    const SimparticCliLicense = require('./options/_license');
    SimparticCliLicense.license();
}
//
// new
//
else if (options.new || options.command && (options.command[0] === 'new' || options.command[0] === 'n')) {
    const SimparticCliNew = require('./options/_new');
    SimparticCliNew.new();
}
//
// help
//
else if (Object.keys(options).length === 0 || options.help || options.command && (options.command[0] === 'help' || options.command[0] === 'h')) {
    SimparticCliHelp.help();
} else {
    let unknown_option = options ? options.command ? options.command[0] : options._unknown[0].replace(/-/g,'') : options._unknown[0].replace(/-/g,'');
    SimparticCliHelp.unknown(unknown_option);
}

console.log(options);