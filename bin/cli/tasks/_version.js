#!/usr/bin/env node

const SimparticCliTools = require('./../_tools');
const fs = require('fs');

class SimparticCliVersion {
    static version() {
        const self = SimparticCliVersion;
        const package_json = JSON.parse(fs.readFileSync(__dirname + '/../../../package.json','utf-8'));
        console.log(`${package_json.name} ${package_json.version} @ ${package_json.date}`);
    }
}

module.exports = SimparticCliVersion;