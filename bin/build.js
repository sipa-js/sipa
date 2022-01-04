/**
 * release build script for sipa
 */
const fs = require("fs");
const util = require('util');
const exec = require("child_process").exec;
const exec_prom = util.promisify(exec);
const { spawn } = require("child_process");
const LuckyCase = require('lucky-case');
const chalk = require('chalk');

const build_destination_dir = './lib/templates/project/default/app/lib/sipa/';

const build_exclusion_markers = [
    /\/\/<!-- MODULE -->\/\/(.*?)\/\/<!-- \/MODULE -->\/\//gs,
]

const version_regex = /"version":\s*"([^"]*)"/sgm;

const release_header_template = `/**
 * 
 * Sipa
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version {{version}}
 * @date {{date}}
 * @link https://github.com/magynhard/sipa
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */
`;

const builds = {
    default_build: {
        destination_file: build_destination_dir + 'sipa.js',
        source_files: [
            './src/sipa/core/sipa-basic-view.js',
            './src/sipa/core/sipa-serializer.js',
            './src/sipa/core/sipa-state.js',
            './src/sipa/tools/sipa-env.js',
            './src/sipa/tools/sipa-helper.js',
            './src/sipa/tools/sipa-hooks.js',
            './src/sipa/tools/sipa-page.js',
            './src/sipa/tools/sipa-url.js',
            './src/sipa/sipa.js',
        ]}
}

function version() {
    const package_json = fs.readFileSync('./package.json','utf8');
    version_regex.lastIndex = 0;
    return version_regex.exec(package_json)[1];
}

function releaseTemplate() {
    return release_header_template.replace('{{version}}', version()).replace('{{date}}',(new Date).toISOString());
}

function prependToFile(file, string) {
    const org_file = fs.readFileSync(file,'utf8');
    fs.writeFileSync(file, string + org_file);
}

console.log(chalk.yellow('###################################'));
console.log(chalk.yellow('# Sipa build script'));
console.log(chalk.yellow('###################################'));
console.log('Building JS ...');
for(let build_key of Object.keys(builds)) {
    const build = builds[build_key];
    console.log(` ${chalk.yellow('-')} ${LuckyCase.toSentenceCase(build_key)} ...`);
    if (fs.existsSync(build.destination_file)) {
        fs.unlinkSync(build.destination_file);
    }
    console.log(`${chalk.yellow('    - transpile')} ...`);
    (function buildRawDestinationFile() {
        let final_file = "";
        build.source_files.forEach((source_file) => {
            final_file += fs.readFileSync(source_file, 'utf8') + "\n";
        });
        build_exclusion_markers.forEach((regex) => {
            final_file = final_file.replace(regex,'');
        });
        fs.writeFileSync(build.destination_file, releaseTemplate() + final_file);
    })();
}

console.log(chalk.green('All done!'));
