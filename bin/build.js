/**
 * Release build script for the Sipa web framework
 */
const fs = require("fs");
const util = require('util');
const exec = require("child_process").exec;
const exec_prom = util.promisify(exec);
const { spawn } = require("child_process");
const LuckyCase = require('lucky-case');
const chalk = require('chalk');
const File = require('ruby-nice/file');
const Dir = require('ruby-nice/dir');
const FileUtils = require('ruby-nice/file-utils');
require('ruby-nice/array');
require('ruby-nice/object');

const SipaCliTools = require('./cli/_tools');

const sipa_build_destination_dir = './lib/templates/project/desktop/app/assets/lib/sipa/';
const sipa_onsen_build_destination_dir = './lib/templates/project/mobile/app/assets/lib/sipa/';

const build_exclusion_markers = [
    /\/\/<!-- MODULE -->\/\/(.*?)\/\/<!-- \/MODULE -->\/\//gs,
]

const version_regex = /"version":\s*"([^"]*)"/sgm;
const date_regex = /"date":\s*"([^"]*)"/sgm;

const release_header_template = `/**
 * 
 * Sipa
 *
 * Particularly simple old school single page lightweight web framework for clever javascript developers.
 *
 * @version {{version}}
 * @date {{date}}
 * @link https://github.com/sipa-js/sipa
 * @author Matthäus J. N. Beyrle
 * @copyright Matthäus J. N. Beyrle
 */
`;

const builds = {
    default_build: {
        destination_file: sipa_build_destination_dir + 'sipa.js',
        source_files: [
            './src/sipa/core/sipa-basic-view.js',
            './src/sipa/core/sipa-events.js',
            './src/sipa/core/sipa-component.js',
            './src/sipa/core/sipa-serializer.js',
            './src/sipa/core/sipa-state.js',
            './src/sipa/tools/sipa-env.js',
            './src/sipa/tools/sipa-helper.js',
            './src/sipa/tools/sipa-hooks.js',
            './src/sipa/tools/sipa-onsen-hooks.js',
            './src/sipa/tools/sipa-page.js',
            './src/sipa/tools/sipa-test.js',
            './src/sipa/tools/sipa-onsen-page.js',
            './src/sipa/tools/sipa-url.js',
            './src/sipa/sipa.js',
            './src/sipa/sipa-onsen.js',
        ]},
    onsenui_build: {
        destination_file: sipa_onsen_build_destination_dir + 'sipa.js',
        source_files: [
            './src/sipa/core/sipa-basic-view.js',
            './src/sipa/core/sipa-events.js',
            './src/sipa/core/sipa-component.js',
            './src/sipa/core/sipa-serializer.js',
            './src/sipa/core/sipa-state.js',
            './src/sipa/tools/sipa-env.js',
            './src/sipa/tools/sipa-helper.js',
            './src/sipa/tools/sipa-hooks.js',
            './src/sipa/tools/sipa-onsen-hooks.js',
            './src/sipa/tools/sipa-page.js',
            './src/sipa/tools/sipa-test.js',
            './src/sipa/tools/sipa-onsen-page.js',
            './src/sipa/tools/sipa-url.js',
            './src/sipa/sipa.js',
            './src/sipa/sipa-onsen.js',
        ]}
}

const copy_static_files = [
    // 'desktop' project (default)
    ['./node_modules/ruby-nice/dist/ruby-nice.js', File.expandPath(sipa_build_destination_dir + '/../ruby-nice/') + '/ruby-nice.js'],
    ['./node_modules/ruby-nice/LICENSE', File.expandPath(sipa_build_destination_dir + '/../ruby-nice/') + '/LICENSE'],

    ['./node_modules/typifier/dist/typifier.js', File.expandPath(sipa_build_destination_dir + '/../typifier/') + '/typifier.js'],
    ['./node_modules/typifier/LICENSE', File.expandPath(sipa_build_destination_dir + '/../typifier/') + '/LICENSE'],

    ['./node_modules/curly-bracket-parser/dist/curly-bracket-parser.js', File.expandPath(sipa_build_destination_dir + '/../curly-bracket-parser/') + '/curly-bracket-parser.js'],
    ['./node_modules/curly-bracket-parser/LICENSE', File.expandPath(sipa_build_destination_dir + '/../curly-bracket-parser/') + '/LICENSE'],

    ['./node_modules/lucky-case/dist/lucky-case.js', File.expandPath(sipa_build_destination_dir + '/../lucky-case/') + '/lucky-case.js'],
    ['./node_modules/lucky-case/LICENSE', File.expandPath(sipa_build_destination_dir + '/../lucky-case/') + '/LICENSE'],

    ['./node_modules/fire-once/dist/fire-once.js', File.expandPath(sipa_build_destination_dir + '/../fire-once/') + '/fire-once.js'],
    ['./node_modules/fire-once/LICENSE', File.expandPath(sipa_build_destination_dir + '/../fire-once/') + '/LICENSE'],

    // 'mobile' project (onsenui)
    ['./node_modules/ruby-nice/dist/ruby-nice.js', File.expandPath(sipa_onsen_build_destination_dir + '/../ruby-nice/') + '/ruby-nice.js'],
    ['./node_modules/ruby-nice/LICENSE', File.expandPath(sipa_onsen_build_destination_dir + '/../ruby-nice/') + '/LICENSE'],

    ['./node_modules/typifier/dist/typifier.js', File.expandPath(sipa_onsen_build_destination_dir + '/../typifier/') + '/typifier.js'],
    ['./node_modules/typifier/LICENSE', File.expandPath(sipa_onsen_build_destination_dir + '/../typifier/') + '/LICENSE'],

    ['./node_modules/curly-bracket-parser/dist/curly-bracket-parser.js', File.expandPath(sipa_onsen_build_destination_dir + '/../curly-bracket-parser/') + '/curly-bracket-parser.js'],
    ['./node_modules/curly-bracket-parser/LICENSE', File.expandPath(sipa_onsen_build_destination_dir + '/../curly-bracket-parser/') + '/LICENSE'],

    ['./node_modules/lucky-case/dist/lucky-case.js', File.expandPath(sipa_onsen_build_destination_dir + '/../lucky-case/') + '/lucky-case.js'],
    ['./node_modules/lucky-case/LICENSE', File.expandPath(sipa_onsen_build_destination_dir + '/../lucky-case/') + '/LICENSE'],
    
    ['./node_modules/fire-once/dist/fire-once.js', File.expandPath(sipa_onsen_build_destination_dir + '/../fire-once/') + '/fire-once.js'],
    ['./node_modules/fire-once/LICENSE', File.expandPath(sipa_onsen_build_destination_dir + '/../fire-once/') + '/LICENSE'],
]

function version() {
    const package_json = SipaCliTools.readFile('./package.json');
    version_regex.lastIndex = 0;
    return version_regex.exec(package_json)[1];
}

function releaseTemplate() {
    return release_header_template.replace('{{version}}', version()).replace('{{date}}',(new Date).toISOString());
}

function updateSipaVersion() {
    let split_version = version().split('.');
    split_version[split_version.length-1] = parseInt(split_version[split_version.length-1])+1;
    const new_version = split_version.join('.');
    // package.json
    let package_json = fs.readFileSync('./package.json','utf8');
    package_json = package_json.replace(version_regex, `"version": "${new_version}"`);
    fs.writeFileSync('./package.json', package_json, 'utf8');
    // project class
    let project_js = fs.readFileSync('./src/sipa/sipa.js','utf8');
    project_js = project_js.replace(/Sipa\._version\s*=\s*"[^"]+";/gm, `Sipa._version = "${new_version}";`)
    fs.writeFileSync('./src/sipa/sipa.js', project_js, 'utf8');
    return new_version;
}

function updateDate() {
    const new_date = (new Date()).toISOString();
    // package.json
    let package_json = fs.readFileSync('./package.json','utf8');
    package_json = package_json.replace(date_regex, `"date": "${new_date}"`);
    fs.writeFileSync('./package.json', package_json, 'utf8');
    return new_date;
}

console.log(chalk.yellow('###################################'));
console.log(chalk.yellow('# Sipa build script'));
console.log(chalk.yellow('###################################'));
console.log(`Updating version from ${version()} ...`);
console.log(`... to version ${updateSipaVersion()} @ ${updateDate()}`);
console.log();
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
            final_file += SipaCliTools.readFile(source_file) + "\n";
        });
        build_exclusion_markers.forEach((regex) => {
            final_file = final_file.replace(regex,'');
        });
        SipaCliTools.writeFile(build.destination_file, releaseTemplate() + final_file);
    })();
}
console.log('Copy static files ...');
copy_static_files.eachWithIndex((val, index) => {
    const key = val[0];
    const value = val[1];
    console.log(` - ${key} -> ${value}`);
    if(!File.isDirectory(File.getDirname(value))) {
        FileUtils.mkdirP(File.getDirname(value));
    }
    FileUtils.copy(key, value);
});

console.log(chalk.green('All done!'));
