#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./../_tools');
const fs = require('fs');

class SimparticCliIndexer {
    static index() {
        const self = SimparticCliIndexer;
        let section = SimparticCliTools.colorizeValues(self.SECTIONS.index,['desc'],'green');
        console.log(commandLineUsage(section));
    }
}

SimparticCliIndexer.SECTIONS = {};
SimparticCliIndexer.SECTIONS.index = [
    {
        header: 'Indexer',
        content: [
            'Automatically scan and add or remove dependencies in the {green index.html} of your app.',
            '',
            "There's also an ignore option to ignore some files explicitly."
        ]
    }
];

module.exports = SimparticCliIndexer;