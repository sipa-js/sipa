#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./../_tools');
const fs = require('fs');

const util = require('util');
const exec = require("child_process").exec;
const spawn = require("child_process").spawn;
const exec_prom = util.promisify(exec);

class SimparticCliServer {
    static server() {
        const self = SimparticCliServer;
        if(SimparticCliTools.isRunningInsideValidSimparticProject()) {
            const usage = commandLineUsage(self._sectionServerStart());
            console.log(usage);
            self._runLiveServerAndSass();

        } else {
            SimparticCliTools.errorNotInsideValidSimparticProject();
        }
    }

    static _runLiveServerAndSass() {
        (async function run() {
            const host = SimparticCliTools.projectSimparticConfig().development_server.host;
            const port = SimparticCliTools.projectSimparticConfig().development_server.port;
            const server_command = `node ${SimparticCliTools.simparticRootPath()}/node_modules/live-server/live-server.js --port=${port} --host=${host} --ignore=lang --mount=/:./app --open="/"`;
            const sass_command = `node ${SimparticCliTools.simparticRootPath()}/node_modules/sass/sass.js --watch --update ./app/assets/style ./app/views --no-source-map`;
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
        const config = SimparticCliTools.projectSimparticConfig();
        return [
            {
                header: 'Running live development web server',
                content: [
                    `Starting live web server listening on {green ${config.development_server.host}} at port {green ${config.development_server.port}}`,
                    '',
                    'If you want to modify the {green host} or {green port} of the live development web server, edit {green simpartic.json} in your project root directory.',
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
                    'If you want to modify the watch paths of the live development sass compilation server, edit {green simpartic.json} in your project root directory.',
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

SimparticCliServer.SECTIONS = {};

module.exports = SimparticCliServer;