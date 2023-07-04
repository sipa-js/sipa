#!/usr/bin/env node

const commandLineArgs = require('command-line-args');
const chalk = require('chalk');

const SipaCliTools = require('./_tools');
const SipaCliHelp = require('./tasks/_help');

const taskDefinitions = [
    {name: 'command', type: String, multiple: true, defaultOption: true}, // fall back command
    {name: 'about', alias: 'a', type: Boolean},
    {name: 'build', alias: 'b', type: Boolean},
    {name: 'generate', alias: 'g', type: Boolean},
    {name: 'help', alias: 'h', type: Boolean},
    {name: 'indexer', alias: 'i', type: Boolean},
    {name: 'license', alias: 'l', type: Boolean},
    {name: 'new', alias: 'n', type: Boolean},
    {name: 'server', alias: 's', type: Boolean},
    {name: 'version', alias: 'v', type: Boolean},
]

const tasks = commandLineArgs(taskDefinitions, {partial: true});

let server_was_running = null;

SipaCliTools.executeHook('before_all');

function logo() {
    console.log(SipaCliTools.logo());
}

//
// about
//
if (tasks.about || tasks.command && (tasks.command[0] === 'about' || tasks.command[0] === 'a')) {
    logo();
    const SipaCliAbout = require('./tasks/_about');
    SipaCliAbout.about();
}
//
// build
//
else if (tasks.build || tasks.command && (tasks.command[0] === 'build' || tasks.command[0] === 'b')) {
    logo();
    SipaCliTools.executeHook('before_build');
    const SipaCliBuild = require('./tasks/_build');
    SipaCliBuild.build();
    SipaCliTools.executeHook('after_build');
}
//
// indexer
//
else if (tasks.indexer || tasks.command && (tasks.command[0] === 'indexer' || tasks.command[0] === 'i')) {
    logo();
    SipaCliTools.executeHook('before_indexer');
    const SipaCliIndexer = require('./tasks/_indexer');
    SipaCliIndexer.index();
    SipaCliTools.executeHook('after_indexer');
}
//
// version
//
else if (tasks.version || tasks.command && (tasks.command[0] === 'version' || tasks.command[0] === 'v')) {
    const SipaCliVersion = require('./tasks/_version');
    SipaCliVersion.version();
}
//
// license
//
else if (tasks.license || tasks.command && (tasks.command[0] === 'license' || tasks.command[0] === 'l')) {
    logo();
    const SipaCliLicense = require('./tasks/_license');
    SipaCliLicense.license();
}
//
// new
//
else if (tasks.new || tasks.command && (tasks.command[0] === 'new' || tasks.command[0] === 'n')) {
    logo();
    const SipaCliNew = require('./tasks/_new');
    SipaCliNew.new();
}
//
// generate
//
else if (tasks.generate || tasks.command && (tasks.command[0] === 'generate' || tasks.command[0] === 'g')) {
    logo();
    SipaCliTools.executeHook('before_generate');
    const SipaCliGenerate = require('./tasks/_generate');
    SipaCliGenerate.generate();
    SipaCliTools.executeHook('after_generate');
}
//
// server
//
else if (tasks.server || tasks.command && (tasks.command[0] === 'server' || tasks.command[0] === 's')) {
    logo();
    SipaCliTools.executeHook('before_server');
    server_was_running = true;
    const SipaCliServer = require('./tasks/_server');
    SipaCliServer.server();
}
//
// help
//
else if (Object.keys(tasks).length === 0 || tasks.help || tasks.command && (tasks.command[0] === 'help' || tasks.command[0] === 'h')) {
    logo();
    SipaCliHelp.help();
} else {
    logo();
    let unknown_option = tasks ? tasks.command ? tasks.command[0] : tasks._unknown[0].replace(/-/g,'') : tasks._unknown[0].replace(/-/g,'');
    SipaCliHelp.unknown(unknown_option);
}

let exit_done = false;
function exitTasks() {
    if(!exit_done) {
        exit_done = true;
        if(server_was_running) SipaCliTools.executeHook('after_server');
        SipaCliTools.executeHook('after_all');
    }
    exit_done = true;
}

const others = [`exit`,`SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`]
others.forEach((eventType) => {
    process.on(eventType, () => {
        exitTasks();
    });
})