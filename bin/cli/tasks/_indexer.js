#!/usr/bin/env node

const chalk = require('chalk');
const commandLineUsage = require('command-line-usage');
const fs = require('fs');

const SipaCliTools = require('./../_tools');
const SipaCliOptions = require('./../_cli-options');
const SipaIndexManager = require('./../_index-manager');

class SipaCliIndexer {
    static optionDefinitions() {
        return [
            { name: 'dry-run', type: Boolean, description: 'Preview changes without applying' },
            { name: 'list', type: Boolean, description: 'List missing and invalid entries' },
            { name: 'auto', type: Boolean, description: 'Add all missing and remove all invalid entries' },
            { name: 'add', type: String, description: 'Comma-separated indices to add' },
            { name: 'ignore', type: String, description: 'Comma-separated indices to ignore' },
            { name: 'add-all', type: Boolean, description: 'Add all missing entries' },
            { name: 'ignore-all', type: Boolean, description: 'Ignore all missing entries' },
            { name: 'remove-missing', type: Boolean, description: 'Remove entries pointing to non-existing files' },
            { name: 'help', type: Boolean, description: 'Show help' },
        ];
    }

    static run(argv) {
        const self = SipaCliIndexer;
        const args = SipaCliOptions.parse(self.optionDefinitions(), argv);
        if (args.help) {
            console.log(commandLineUsage(self.SECTIONS.indexer_help));
            return;
        }
        if (!SipaCliTools.isRunningInsideValidSipaProject()) {
            SipaCliTools.errorNotInsideValidSipaProject();
            return;
        }
        const sim = SipaIndexManager;
        const missing_entries = sim.missingEntries();
        const missing_files = sim.missingFiles();

        if (args.list) {
            self._renderList(missing_entries, missing_files);
            return;
        }

        const has_cli_action = args['dry-run'] || args['auto'] || args['add-all'] || args['ignore-all'] ||
            args['add'] || args['ignore'] || args['remove-missing'];

        console.log(commandLineUsage(self.SECTIONS.index));
        if (!args.list && !has_cli_action) {
            console.log(commandLineUsage(self.SECTIONS.examples));
        }
        console.log(commandLineUsage(self.SECTIONS.files_not_included));

        if (missing_entries.length === 0) {
            console.log(commandLineUsage(console.log(chalk`  There are no existing files missing in {green index.html}`)));
        } else {
            if (has_cli_action) {
                self._handleMissingEntriesCli(missing_entries, args);
            } else {
                console.log('  → ' + missing_entries.map((e, i) => {
                    return '[' + chalk.green(i) + '] ' + e
                }).join('\n  → '));
                console.log();
                const input = self._numbersPrompt(0, missing_entries.length - 1);
                self._applyInput(missing_entries, input);
            }
        }

        // included files that do not exist
        console.log(commandLineUsage(self.SECTIONS.files_not_existing));
        if (missing_files.length === 0) {
            console.log(commandLineUsage(console.log(chalk`  There are no remaining not existing files included in {green index.html}`)));
        } else {
            if (args['dry-run']) {
                console.log('Would remove missing files:');
                missing_files.forEach(e => console.log(chalk.red(`  - ${e}`)));
            } else if (args['remove-missing'] || args['auto']) {
                console.log('  → ' + missing_files.map((e) => {
                    return chalk.red(e)
                }).join('\n  → '));
                console.log();
                for (let entry of missing_files) {
                    sim.removeEntry(entry);
                    console.log(chalk.red(`  - ${entry}`));
                }
            } else {
                console.log('  → ' + missing_files.map((e) => {
                    return chalk.red(e)
                }).join('\n  → '));
                console.log();
                let input = SipaCliTools.cliQuestion(chalk`Do you want to remove this invalid included file(s) from {green index.html}?`, ['yes', 'no'], 'yes', true);
                if (input === 'yes') {
                    console.log();
                    for (let entry of missing_files) {
                        sim.removeEntry(entry);
                        console.log(chalk.red(`  - ${entry}`));
                    }
                }
                console.log();
            }
        }
        console.log(chalk`  {green done}`);
        console.log();
    }

    static _handleMissingEntriesCli(missing_entries, args) {
        const self = SipaCliIndexer;
        if (args['dry-run']) {
            console.log('Would handle missing entries:');
            missing_entries.forEach((e, i) => console.log(`  [${i}] ${e}`));
            return;
        }
        if (args['auto'] || args['add-all']) {
            for (let entry of missing_entries) {
                const section = SipaIndexManager._getSectionByPath(entry);
                SipaIndexManager.appendEntry(section, entry);
                console.log(chalk.green(`  + ${entry}`));
            }
        } else if (args['ignore-all']) {
            let config = SipaCliTools.readProjectSipaConfig();
            for (let entry of missing_entries) {
                config.indexer.ignored_files.push(entry);
                console.log(chalk.red(`  - ${entry}`));
            }
            config.indexer.ignored_files = SipaCliTools.uniqArray(config.indexer.ignored_files).sort();
            SipaCliTools.writeProjectSipaConfig(config);
        } else {
            self._applyByIndices(missing_entries, args['add'], args['ignore']);
        }
    }

    static _applyInput(missing_entries, input) {
        const sim = SipaIndexManager;
        if (input === '+') {
            for (let entry of missing_entries) {
                const section = sim._getSectionByPath(entry);
                sim.appendEntry(section, entry);
                console.log(chalk.green(`  + ${entry}`));
            }
        } else if (input === '-') {
            let config = SipaCliTools.readProjectSipaConfig();
            for (let entry of missing_entries) {
                config.indexer.ignored_files.push(entry);
                console.log(chalk.red(`  - ${entry}`));
            }
            config.indexer.ignored_files = SipaCliTools.uniqArray(config.indexer.ignored_files).sort();
            SipaCliTools.writeProjectSipaConfig(config);
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
                let config = SipaCliTools.readProjectSipaConfig();
                for (let entry_index of ignore_numbers) {
                    const entry = missing_entries[entry_index];
                    config.indexer.ignored_files.push(entry);
                    console.log(chalk.red(`  - ${entry}`));
                }
                config.indexer.ignored_files = SipaCliTools.uniqArray(config.indexer.ignored_files).sort();
                SipaCliTools.writeProjectSipaConfig(config);
            }
        }
    }

    static _applyByIndices(missing_entries, add_string, ignore_string) {
        const self = SipaCliIndexer;
        const add_indices = self._parseIndices(add_string);
        const ignore_indices = self._parseIndices(ignore_string);
        const sim = SipaIndexManager;

        add_indices.forEach(i => {
            const entry = missing_entries[i];
            const section = sim._getSectionByPath(entry);
            sim.appendEntry(section, entry);
            console.log(chalk.green(`  + ${entry}`));
        });

        if (ignore_indices.length > 0) {
            let config = SipaCliTools.readProjectSipaConfig();
            ignore_indices.forEach(i => {
                const entry = missing_entries[i];
                config.indexer.ignored_files.push(entry);
                console.log(chalk.red(`  - ${entry}`));
            });
            config.indexer.ignored_files = SipaCliTools.uniqArray(config.indexer.ignored_files).sort();
            SipaCliTools.writeProjectSipaConfig(config);
        }
    }

    static _parseIndices(str) {
        if (!str) return [];
        return str.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    }

    static _renderList(missing_entries, missing_files) {
        SipaCliTools.printLine('Files not ignored or not included:');
        missing_entries.forEach((e, i) => console.log(`  [${i}] ${e}`));
        SipaCliTools.printLine('Files included but not existing:');
        missing_files.forEach(e => console.log(`  - ${e}`));
    }

    static _numbersPrompt(valid_min, valid_max) {
        const validate_regex = /^((([\-]|[\+])?[0-9]+[\,]?)+|\+|\-)$/gm;
        let input = null;
        while (true) {
            input = SipaCliTools.cliQuestion(`Make your choice by comma separated number(s) or +/-`, null, null, false);
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
SipaCliIndexer.SECTIONS.indexer_help = [
    {
        header: 'sipa indexer',
        content: 'Manage index.html entries.'
    },
    {
        header: 'Options',
        optionList: [
            { name: 'dry-run', type: Boolean, description: 'Preview changes without applying' },
            { name: 'list', type: Boolean, description: 'List missing and invalid entries' },
            { name: 'auto', type: Boolean, description: 'Add all missing and remove all invalid entries' },
            { name: 'add', type: String, description: 'Comma-separated indices to add' },
            { name: 'ignore', type: String, description: 'Comma-separated indices to ignore' },
            { name: 'add-all', type: Boolean, description: 'Add all missing entries' },
            { name: 'ignore-all', type: Boolean, description: 'Ignore all missing entries' },
            { name: 'remove-missing', type: Boolean, description: 'Remove entries pointing to non-existing files' }
        ]
    }
];

module.exports = SipaCliIndexer;
