#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');
const util = require('util');
const exec = require("child_process").exec;
const execSync = require("child_process").execSync;
const spawn = require("child_process").spawn;
const exec_prom = util.promisify(exec);

const File = require('ruby-nice/file');

const SipaCliTools = require('./../_tools');

class SipaCliServer {
    static server() {
        const self = SipaCliServer;
        if(SipaCliTools.isRunningInsideValidSipaProject()) {
            if(SipaCliTools.invalidConfigPaths().length === 0) {
                const usage = commandLineUsage(self._sectionServerStart());
                console.log(usage);
                self._runLiveServerAndSass();
            } else {
                SipaCliTools.errorInvalidConfigPaths();
            }
        } else {
            SipaCliTools.errorNotInsideValidSipaProject();
        }
    }

    static _runLiveServerAndSass() {
        const self = SipaCliServer;
        (async function run() {
            const host = SipaCliTools.readProjectSipaConfig().development_server?.host || '7000';
            const port = SipaCliTools.readProjectSipaConfig().development_server?.port || '0.0.0.0';
            const npm_path = `${SipaCliTools.sipaRootPath()}/node_modules/live-server/live-server.js`;
            const yarn_path = File.expandPath(`${SipaCliTools.sipaRootPath()}/../../node_modules/live-server/live-server.js`);
            let live_server_js_path = null;
            // npm path
            if(File.isExisting(npm_path)) {
                live_server_js_path = npm_path;
            } // yarn path
            else if(File.isExisting((yarn_path))) {
                live_server_js_path = yarn_path;
            } else {
                throw new Error(`Could not locate live-server.js`);
            }
            const server_command = `node ${live_server_js_path} --port=${port} --host=${host} --ignore=lang --mount=/:./app --open="/"`;
            let server_process = exec(server_command);
            server_process.stdout.on('data', function(data) {
                console.log(data.toString('utf8'));
            });
            self.runSass(`--watch --update ${self._sassWatchPathsInline()} --no-source-map --style=compressed`);
        })();
    }

    /**
     * @param parameters parameters for sass command
     * @param log=true log output or not
     * @param sync=false run sync or async
     * @returns {ChildProcess|Buffer|string} ChildProcess on async, Buffer or string on sync
     */
    static runSass(parameters = "", log = true, sync = false) {
        const npm_path = `${SipaCliTools.sipaRootPath()}/node_modules/sass/sass.js`;
        const yarn_path = `${SipaCliTools.sipaRootPath()}/../../node_modules/sass/sass.js`;
        let sass_server_js_path = null;
        // npm path
        if(File.isExisting(npm_path)) {
            sass_server_js_path = npm_path;
        } // yarn path
        else if(File.isExisting((yarn_path))) {
            sass_server_js_path = yarn_path;
        } else {
            throw new Error(`Could not locate sass.js`);
        }
        const sass_command = `node ${sass_server_js_path} ${parameters}`;
        let sass_process = null;
        if(sync) {
            sass_process = execSync(sass_command);
        } else {
            sass_process = exec(sass_command);
            if(log) {
                sass_process.stdout.on('data', function(data) {
                    console.log(data.toString('utf8'));
                });
            }
        }
        return sass_process;
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

    static _sassWatchPaths() {
        return SipaCliTools.readProjectSipaConfig().development_server?.sass_watch_paths || ['app/assets/style','app/views'];
    }

    static _sassWatchPathsInline() {
        const self = SipaCliServer;
        return self._sassWatchPaths().map((el) => { return el.startsWith('./') ? el : './' + el }).join(' ');
    }
}

SipaCliServer.SECTIONS = {};

module.exports = SipaCliServer;