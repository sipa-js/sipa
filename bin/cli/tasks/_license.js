#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SipaCliTools = require('./../_tools');
const fs = require('fs');

class SipaCliLicense {
    static license() {
        const self = SipaCliLicense;
        let section = SipaCliTools.colorizeValues(self.SECTIONS.license,['desc'],'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }
}

SipaCliLicense.SECTIONS = {};
SipaCliLicense.SECTIONS.license = [
    {
        header: 'License',
        content: fs.readFileSync(__dirname + '/../../../LICENSE','utf-8')
    }
];

module.exports = SipaCliLicense;