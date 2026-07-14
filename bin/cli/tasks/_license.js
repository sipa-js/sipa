#!/usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');

const SipaCliTools = require('./../_tools');

class SipaCliLicense {
    static run(argv = []) {
        if (argv.includes('--json')) {
            const package_json = JSON.parse(SipaCliTools.readFile(__dirname + '/../../../package.json'));
            console.log(JSON.stringify({ license: package_json.license }));
            return;
        }
        SipaCliLicense.license();
    }

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
        content: SipaCliTools.readFile(__dirname + '/../../../LICENSE')
    }
];

module.exports = SipaCliLicense;