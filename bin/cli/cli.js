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

const taskMap = {
    about: { module: './tasks/_about', showLogo: true, hooks: null },
    a: { module: './tasks/_about', showLogo: true, hooks: null },
    build: { module: './tasks/_build', showLogo: true, hooks: { before: 'before_build', after: 'after_build' } },
    b: { module: './tasks/_build', showLogo: true, hooks: { before: 'before_build', after: 'after_build' } },
    generate: { module: './tasks/_generate', showLogo: true, hooks: { before: 'before_generate', after: 'after_generate' } },
    g: { module: './tasks/_generate', showLogo: true, hooks: { before: 'before_generate', after: 'after_generate' } },
    indexer: { module: './tasks/_indexer', showLogo: true, hooks: { before: 'before_indexer', after: 'after_indexer' } },
    i: { module: './tasks/_indexer', showLogo: true, hooks: { before: 'before_indexer', after: 'after_indexer' } },
    license: { module: './tasks/_license', showLogo: true, hooks: null },
    l: { module: './tasks/_license', showLogo: true, hooks: null },
    new: { module: './tasks/_new', showLogo: true, hooks: null },
    n: { module: './tasks/_new', showLogo: true, hooks: null },
    server: { module: './tasks/_server', showLogo: true, hooks: { before: 'before_server', after: 'after_server' } },
    s: { module: './tasks/_server', showLogo: true, hooks: { before: 'before_server', after: 'after_server' } },
    version: { module: './tasks/_version', showLogo: false, hooks: null },
    v: { module: './tasks/_version', showLogo: false, hooks: null },
};

let server_was_running = null;

SipaCliTools.executeHook('before_all');

function logo() {
    console.log(SipaCliTools.logo());
}

const commandName = tasks.command ? tasks.command[0] : null;
const explicitTask = ['about','build','generate','indexer','license','new','server','version'].find(name => tasks[name] === true);
const resolvedCommand = commandName || explicitTask;
const taskConfig = resolvedCommand ? taskMap[resolvedCommand] : null;

if (taskConfig) {
    if (taskConfig.showLogo) logo();
    if (taskConfig.hooks && taskConfig.hooks.before) SipaCliTools.executeHook(taskConfig.hooks.before);
    if (resolvedCommand === 'server' || resolvedCommand === 's') server_was_running = true;
    const commandArgv = process.argv.slice(process.argv.indexOf(resolvedCommand) + 1);
    const TaskModule = require(taskConfig.module);
    TaskModule.run(commandArgv);
    if (taskConfig.hooks && taskConfig.hooks.after) SipaCliTools.executeHook(taskConfig.hooks.after);
}
//
// help
//
else if (Object.keys(tasks).length === 0 || tasks.help || tasks.command && (tasks.command[0] === 'help' || tasks.command[0] === 'h')) {
    logo();
    const sub_command = tasks.command && tasks.command[1] ? tasks.command[1] : null;
    SipaCliHelp.help(sub_command);
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
