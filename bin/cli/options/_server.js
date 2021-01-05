#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./../_tools');
const fs = require('fs');

class SimparticCliServer {
    static server() {
        const self = SimparticCliServer;
        if(SimparticCliTools.isRunningInsideValidSimparticProject()) {
            const usage = commandLineUsage(self._sectionServerStart());
            console.log(usage);
        } else {
            const usage = commandLineUsage(self.SECTIONS.not_inside_valid_project);
            console.log(usage);
        }
    }

    static _sectionServerStart() {
        const config = SimparticCliTools.projectSimparticConfig();
        return [
            {
                header: 'Running live development server',
                content: [
                    `Listening on {green ${config.development_server.host}} at port {green ${config.development_server.port}}.`,
                    '',
                    'If you want to modify host or port, edit {green simpartic.json} in your project root directory.',
                    '',
                    'To stop the live development sever, press CTRL+C.'
                ]
            }
        ]
    }
}

SimparticCliServer.SECTIONS = {};
SimparticCliServer.SECTIONS.not_inside_valid_project = [
    {
        header: 'Invalid project directory',
        content: [
            '{red You can run this command at the root of a valid simpartic project only.}',
            '',
            `Current directory:\n {green ${SimparticCliTools.projectRootPath()}}`
        ]
    }
]

module.exports = SimparticCliServer;