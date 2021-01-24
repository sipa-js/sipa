#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./../_tools');
const fs = require('fs');

class SimparticCliBuild {
    static build() {
        const self = SimparticCliBuild;
        let section = SimparticCliTools.colorizeValues(self.SECTIONS.build,['desc'],'green');
        console.log(commandLineUsage(section));
    }
}

SimparticCliBuild.SECTIONS = {};
SimparticCliBuild.SECTIONS.build = [
    {
        header: 'Make production build',
        content: [
            'Your app is ready to published?',
            '',
            "It's time to put all javascript and styles together, each in one file. Then minify them."
        ]
    }
];

module.exports = SimparticCliBuild;