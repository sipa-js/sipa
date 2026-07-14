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
const SipaCliOptions = require('./../_cli-options');

class SipaCliServer {
    static optionDefinitions() {
        return [
            { name: 'host', type: String, description: 'Server host' },
            { name: 'port', type: String, description: 'Server port' },
            { name: 'no-open', type: Boolean, description: 'Do not open browser' },
            { name: 'mount', type: String, description: 'Mount point' },
            { name: 'help', type: Boolean, description: 'Show help' },
        ];
    }

    static run(argv) {
        const self = SipaCliServer;
        const args = SipaCliOptions.parse(self.optionDefinitions(), argv);
        if (args.help) {
            console.log(commandLineUsage(self.SECTIONS.server_help));
            return;
        }
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        self.server(args);
    }

    static server(args = {}) {
        const self = SipaCliServer;
        if (SipaCliTools.invalidConfigPaths().length === 0) {
            const usage = commandLineUsage(self._sectionServerStart(args));
            console.log(usage);
            self._runLiveServerAndSass(args);
        } else {
            SipaCliTools.errorInvalidConfigPaths();
        }
    }

    static _runLiveServerAndSass(args = {}) {
        const self = SipaCliServer;
        (async function run() {
            const config = SipaCliTools.readProjectSipaConfig();
            const host = args.host || config?.development_server?.host || '0.0.0.0';
            const port = args.port || config?.development_server?.port || '7000';
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
            let mount = args.mount || config?.development_server?.mount?.trim() || '/';
            if (!mount.endsWith('/')) mount += '/';
            // open only if configured and not disabled by CLI
            let open_param = '';
            const should_open = !args['no-open'] && (config?.development_server?.open === true);
            if (should_open) {
                let open_url = config?.development_server?.open_url?.trim() || mount;
                open_param = `--open="${open_url}"`;
            }
            // final server command to start server
            const server_command = `node "${live_server_js_path}" --port=${port} --host=${host} --ignore=lang --mount="${mount}":./${SipaCliTools.projectBaseAppDir()} ${open_param}`;
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

    static _sectionServerStart(args = {}) {
        const config = SipaCliTools.readProjectSipaConfig();
        const host = args.host || config?.development_server?.host || '0.0.0.0';
        const port = args.port || config?.development_server?.port || '7000';
        return [
            {
                header: 'Running live development web server',
                content: [
                    `Starting live web server listening on {green ${host}} at port {green ${port}}`,
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
                        return chalk.green(`${SipaCliTools.projectBaseAppDir()}/${e}`);
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
                return `${quote}./${SipaCliTools.projectBaseAppDir()}/${el.substring(2)}${quote}`;
            } else {
                return `${quote}./${SipaCliTools.projectBaseAppDir()}/${el}${quote}`;
            }
        }).join(' ');
    }
}

SipaCliServer.SECTIONS = {};
SipaCliServer.SECTIONS.server_help = [
    {
        header: 'sipa server',
        content: 'Run the development server.'
    },
    {
        header: 'Options',
        optionList: [
            { name: 'host', type: String, description: 'Server host' },
            { name: 'port', type: String, description: 'Server port' },
            { name: 'no-open', type: Boolean, description: 'Do not open browser' },
            { name: 'mount', type: String, description: 'Mount point' }
        ]
    }
];

module.exports = SipaCliServer;