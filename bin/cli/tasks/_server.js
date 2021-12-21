#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SipaCliTools = require('./../_tools');
const fs = require('fs');

const util = require('util');
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const exec_prom = util.promisify(exec);

class SipaCliServer {
    static server() {
        const self = SipaCliServer;
        if(SipaCliTools.isRunningInsideValidSipaProject()) {
            const usage = commandLineUsage(self._sectionServerStart());
            console.log(usage);
            self._runLiveServerAndSass();

        } else {
            SipaCliTools.errorNotInsideValidSipaProject();
        }
    }

    static _runLiveServerAndSass() {
        (async function run() {
            const host = SipaCliTools.readProjectSipaConfig().development_server?.host || '7000';
            const port = SipaCliTools.readProjectSipaConfig().development_server?.port || '0.0.0.0';
            const sass_watch_paths = SipaCliTools.readProjectSipaConfig().development_server?.sass_watch_paths || ['app/assets/style','app/views'];
            const sass_paths_inline = sass_watch_paths.map((el) => { return el.startsWith('./') ? el : './' }).join(' ');
            const server_command = `node ${SipaCliTools.sipaRootPath()}/node_modules/live-server/live-server.js --port=${port} --host=${host} --ignore=lang --mount=/:./app --open="/"`;
            const sass_command = `node ${SipaCliTools.sipaRootPath()}/node_modules/sass/sass.js --watch --update ${sass_paths_inline} --no-source-map --style=compressed`;
            // await exec_prom(server_command + ' & ' + sass_command).then(() => {
            //     console.log("...");
            // });
            let server_process = exec(server_command);
            server_process.stdout.on('data', function(data) {
                console.log(data.toString('utf8'));
            });
            let sass_process = exec(sass_command);
            sass_process.stdout.on('data', function(data) {
                console.log(data.toString('utf8'));
            });
        })();
    }

    static _sectionServerStart() {
        const config = SipaCliTools.readProjectSipaConfig();
        return [
            {
                header: 'Running live development web server',
                content: [
                    `Starting live web server listening on {green ${config.development_server.host}} at port {green ${config.development_server.port}}`,
                    '',
                    'If you want to modify the {green host} or {green port} of the live development web server, edit {green sipa.json} in your project root directory.',
                    '',
                ]
            },
            {
                header: 'Running live development sass compilation server',
                content: [
                    `Starting live sass file watcher listening on {green *.scss} files to compile to {green *.css} files automatically`,
                    '',
                    `Watch paths: \n  - ${config.development_server.sass_watch_paths.map((e) => { return chalk.green(e); }).join("\n  - ")}`,
                    '',
                    'If you want to modify the watch paths of the live development sass compilation server, edit {green sipa.json} in your project root directory.',
                    '',
                ]
            },
            {
                header: "Servers log",
                content: '{red To stop the live development severs, press CTRL+C.}'
            }
        ]
    }
}

SipaCliServer.SECTIONS = {};

module.exports = SipaCliServer;