#!/usr/bin/env node

const fs = require('fs');

const SipaCliTools = require('./../_tools');

class SipaCliVersion {
    static version() {
        const self = SipaCliVersion;
        const package_json = JSON.parse(SipaCliTools.readFile(__dirname + '/../../../package.json'));
        console.log(`${package_json.name} ${package_json.version} @ ${package_json.date}`);
    }
}

module.exports = SipaCliVersion;