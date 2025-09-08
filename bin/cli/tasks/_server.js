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
        if (SipaCliTools.isRunningInsideValidSipaProject()) {
            if (SipaCliTools.invalidConfigPaths().length === 0) {
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
            const config = SipaCliTools.readProjectSipaConfig();
            const host = config?.development_server?.host || '0.0.0.0';
            const port = config?.development_server?.port || '7000';
            const npm_path = `${SipaCliTools.sipaRootPath()}/node_modules/sipa-live-server/bin/sipa-live-server.js`;
            const yarn_path = File.expandPath(`${SipaCliTools.sipaRootPath()}/../../node_modules/sipa-live-server/bin/sipa-live-server.js`);
            let live_server_js_path = null;
            // npm path
            if (File.isExisting(npm_path)) {
                live_server_js_path = npm_path;
            } // yarn path
            else if (File.isExisting((yarn_path))) {
                live_server_js_path = yarn_path;
            } else {
                throw new Error(`Could not locate sipa-live-server.js`);
            }
            // configure mount point
            let mount = config?.development_server?.mount?.trim() || '/';
            if (!mount.endsWith('/')) mount += '/';
            // open only if configured
            let open_param = '';
            if(config?.development_server?.open === true) {
                open_param = '--open="${mount}"';
            }
            // final server command to start server
            const server_command = `node "${live_server_js_path}" --port=${port} --host=${host} --ignore=lang --mount="${mount}":./app ${open_param}`;
            let server_process = exec(server_command);
            server_process.stdout.on('data', function (data) {
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
        if (File.isExisting(npm_path)) {
            sass_server_js_path = npm_path;
        } // yarn path
        else if (File.isExisting((yarn_path))) {
            sass_server_js_path = yarn_path;
        } else {
            throw new Error(`Could not locate sass.js`);
        }
        const sass_command = `node "${sass_server_js_path}" ${parameters}`;
        let sass_process = null;
        if (sync) {
            sass_process = execSync(sass_command);
        } else {
            sass_process = exec(sass_command);
            if (log) {
                sass_process.stdout.on('data', function (data) {
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
                    `Watch paths: \n  - ${config.development_server.sass_watch_paths.map((e) => {
                        return chalk.green(`app/${e}`);
                    }).join("\n  - ")}`,
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
        return SipaCliTools.readProjectSipaConfig().development_server?.sass_watch_paths || ['assets/style', 'views'];
    }

    static _sassWatchPathsInline(quote_paths = true) {
        const self = SipaCliServer;
        return self._sassWatchPaths().map((el) => {
            let quote = '';
            if (quote_paths) {
                quote = '"';
            }
            if (el.startsWith('./')) {
                return `${quote}./app/${el.substring(2)}${quote}`;
            } else {
                return `${quote}./app/${el}${quote}`;
            }
        }).join(' ');
    }
}

SipaCliServer.SECTIONS = {};

module.exports = SipaCliServer;