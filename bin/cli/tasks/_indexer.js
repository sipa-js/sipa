#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const SipaCliTools = require('./../_tools');
const fs = require('fs');
const tools = require('./../_tools');

const SipaIndexManager = require('./../_index-manager');

class SipaCliIndexer {
    static index() {
        const self = SipaCliIndexer;
        const sim = SipaIndexManager;
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        console.log(commandLineUsage(self.SECTIONS.index));
        console.log(commandLineUsage(self.SECTIONS.examples));
        console.log(commandLineUsage(self.SECTIONS.files_not_included));
        let missing_entries = sim.missingJsEntries().concat(sim.missingStyleEntries());
        const ignored_entries = tools.readProjectSipaConfig().indexer?.ignored_files || [];
        missing_entries.forEach((el, i) => {
           if(ignored_entries.includes(el)) {
               delete missing_entries[i];
           }
        });
        missing_entries = missing_entries.filter(e => e !== null);
        if (missing_entries.length === 0) {
            console.log(commandLineUsage(console.log(chalk`  There are no existing files missing in {green index.html}`)));
        } else {
            console.log('  → ' + missing_entries.map((e, i) => {
                return '[' + chalk.green(i) + '] ' + e
            }).join('\n  → '));
            console.log();
            const input = self._numbersPrompt(0, missing_entries.length - 1);
            console.log();
            if (input === '+') {
                for (let entry of missing_entries) {
                    const section = sim._getSectionByPath(entry);
                    sim.appendEntry(section, entry);
                    console.log(chalk.green(`  + ${entry}`));
                }
            } else if (input === '-') {
                let config = tools.readProjectSipaConfig();
                for (let entry of missing_entries) {
                    config.indexer.ignored_files.push(entry);
                    console.log(chalk.red(`  - ${entry}`));
                }
                config.indexer.ignored_files = tools.uniqArray(config.indexer.ignored_files).sort();
                tools.writeProjectSipaConfig(config);
            } else {
                const all_numbers = input.split(',');
                const add_numbers = all_numbers.filter(e => !e.startsWith('-')).map(e => parseInt(e.replace('+', '')));
                const ignore_numbers = all_numbers.filter(e => e.startsWith('-')).map(e => parseInt(e.replace('-', '')));
                for (let entry_index of add_numbers) {
                    const entry = missing_entries[entry_index];
                    const section = sim._getSectionByPath(entry);
                    sim.appendEntry(section, entry);
                    console.log(chalk.green(`  + ${entry}`));
                }
                if (ignore_numbers.length > 0) {
                    let config = tools.readProjectSipaConfig();
                    for (let entry_index of ignore_numbers) {
                        const entry = missing_entries[entry_index];
                        config.indexer.ignored_files.push(entry);
                        console.log(chalk.red(`  - ${entry}`));
                    }
                    config.indexer.ignored_files = tools.uniqArray(config.indexer.ignored_files).sort();
                    tools.writeProjectSipaConfig(config);
                }
            }
        }
        // included files that does not exist
        console.log(commandLineUsage(self.SECTIONS.files_not_existing));
        let existing_entries = sim.getJsEntries().concat(sim.getStyleEntries());
        const existing_files = sim.getJsFiles().concat(sim.getStyleFiles());
        existing_entries.forEach((el, i) => {
            if(existing_files.includes(el)) {
                delete existing_entries[i];
            }
        });
        existing_entries = existing_entries.filter(e => e !== null);
        if (existing_entries.length === 0) {
            console.log(commandLineUsage(console.log(chalk`  There are no remaining not existing files included in {green index.html}`)));
        } else {
            console.log('  → ' + existing_entries.map((e, i) => {
                return chalk.red(e)
            }).join('\n  → '));
            console.log();
            let input = tools.cliQuestion(chalk`Do you want to remove this invalid included file(s) from {green index.html}?`, ['yes','no'], 'yes', true);
            if(input === 'yes') {
                console.log();
                for(let entry of existing_entries) {
                    sim.removeEntry(entry);
                    console.log(chalk.red(`  - ${entry}`));
                }
            }
            console.log();
        }
        console.log(chalk`  {green done}`);
        console.log();
    }

    static _numbersPrompt(valid_min, valid_max) {
        const validate_regex = /^((([\-]|[\+])?[0-9]+[\,]?)+|\+|\-)$/gm;
        let input = null;
        while (true) {
            input = tools.cliQuestion(`Make your choice by comma separated number(s) or +/-`, null, null, false);
            // CTRL+C
            if (input === null) {
                process.exit(1);
            }
            if (!input || !input.match(validate_regex)) {
                console.log(chalk.red(`  Invalid input! Read the instructions above!`));
            } else {
                let invalid_matches = [];
                if (typeof valid_min != 'undefined') {
                    const invalid_numbers = input.split(',').map(e => parseInt(e.replace('-', '').replace('+', ''))).filter(e => e < valid_min)
                    invalid_matches = invalid_matches.concat(invalid_numbers);
                }
                if (typeof valid_max != 'undefined') {
                    const invalid_numbers = input.split(',').map(e => parseInt(e.replace('-', '').replace('+', ''))).filter(e => e > valid_max)
                    invalid_matches = invalid_matches.concat(invalid_numbers);
                }
                if (invalid_matches.length > 0) {
                    console.log(chalk.red(`  Invalid number(s): ${invalid_matches.join(',')}`));
                } else {
                    break;
                }
            }
        }
        return input;
    }
}

SipaCliIndexer.SECTIONS = {};
SipaCliIndexer.SECTIONS.index = [
    {
        header: 'Indexer',
        content: [
            'Automatically scan and add or ignore dependencies in the {green index.html} of your app.',
            '',
            "Select the files to include by the option number, if you want to ignore, add them with a prefixed minus.",
        ]
    }
];
SipaCliIndexer.SECTIONS.examples = [
    {
        header: 'Examples',
        content: [
            {sample: '{green 1}', desc: 'will add option 1 to the {green index.html}'},
            {sample: '{green 1,2}', desc: 'will add option 1 and 2 to the {green index.html}'},
            {sample: '{red -2}', desc: 'will add option 2 to the ignore list in {green sipa.json}'},
            {
                sample: '{red -1}{green ,2}',
                desc: 'will add option 1 to the ignore list in {green sipa.json} and add option 2 to the {green index.html}'
            },
            {sample: '{red -}', desc: 'will add all options to the ignore list in {green sipa.json}'},
            {sample: '{green +}', desc: 'will add all options to the {green index.html}'},
        ]
    }
];
SipaCliIndexer.SECTIONS.files_not_included = [
    {
        header: 'Files not ignored in sipa.json or not included in index.html',
    }
];
SipaCliIndexer.SECTIONS.files_not_existing = [
    {
        header: 'Files not existing but included in index.html',
    }
];

module.exports = SipaCliIndexer;