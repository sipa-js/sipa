#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SipaCliTools = require('./../_tools');
const fs = require('fs');

class SipaCliBuild {
    static build() {
        const self = SipaCliBuild;
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        console.log(commandLineUsage(self.SECTIONS.build));
    }
}

SipaCliBuild.SECTIONS = {};
SipaCliBuild.SECTIONS.build = [
    {
        header: 'Make production build',
        content: [
            'Your app is ready to published?',
            '',
            "It's time to put all javascript and styles together, each in one file. Then minify them."
        ]
    }
];

module.exports = SipaCliBuild;