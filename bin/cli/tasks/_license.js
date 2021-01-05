#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./../_tools');
const fs = require('fs');

class SimparticCliLicense {
    static license() {
        const self = SimparticCliLicense;
        let section = SimparticCliTools.colorizeValues(self.SECTIONS.license,['desc'],'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }
}

SimparticCliLicense.SECTIONS = {};
SimparticCliLicense.SECTIONS.license = [
    {
        header: 'License',
        content: fs.readFileSync(__dirname + '/../../../LICENSE','utf-8')
    }
];

module.exports = SimparticCliLicense;