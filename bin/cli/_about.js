#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SimparticCliTools = require('./_tools');
const fs = require('fs');

class SimparticCliAbout {
    static about() {
        const self = SimparticCliAbout;
        let section = SimparticCliTools._colorize(self.SECTIONS.about,['desc'],'green');
        const usage = commandLineUsage(section);
        console.log(usage);
    }
}

const package_json = JSON.parse(fs.readFileSync(__dirname + '/../../package.json','utf-8'));

SimparticCliAbout.SECTIONS = {};
SimparticCliAbout.SECTIONS.about = [
    {
        header: 'Description',
        content: package_json.description
    },
    {
        header: 'About',
        content: [
            {
                desc: 'Version',
                summary: package_json.version
            },
            {
                desc: 'Date',
                summary: (new Date(package_json.date)).toLocaleDateString()
            },
            {
                desc: 'Author',
                summary: package_json.author
            },
            {
                desc: 'Website',
                summary: `{underline ${package_json.homepage}}`
            },
            {
                desc: '',
                summary: ''
            },
            {
                desc: 'License',
                summary: package_json.license
            },
        ]
    },
    {
        header: 'License',
        content: fs.readFileSync(__dirname + '/../../LICENSE','utf-8')
    }
];

module.exports = SimparticCliAbout;