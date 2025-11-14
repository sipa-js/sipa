/**
 * Prepare jasmin-browser before running tests
 */
require('ruby-nice');
const File = require('ruby-nice/file');

console.log("Prepare testing environment ...");

//
// add js sources of index.html in the same order to source file config of jasmine
//
const script_regex = /<script.*src="([^"]+)">/gm;

const sipa_config = JSON.parse(File.read('sipa.json'));
const app_base_dir = sipa_config?.app_base_dir || 'app';

const jobs = [
    {
        config: 'spec/support/jasmine-browser.json',
        html: `${app_base_dir}/index.html`,
    },
    {
        config: 'spec/support/jasmine-browser-dist.json',
        html: 'dist/default/index.html',
    }
];

jobs.eachWithIndex((job) => {
    const html_content = File.read(job.html);
    let group = null;
    let script_files = [];

    while(group = script_regex.exec(html_content)) {
        if(group[1]) {
            const path = group[1];
            const beauty_path = path.substring(0, path.lastIndexOf('?') === -1 ? path.length : path.lastIndexOf('?')); // cut optional parameters
            script_files.push(beauty_path);
        }
    }

    let jasmine_config = JSON.parse(File.read(job.config));
    jasmine_config.srcFiles = script_files;

    File.write(job.config, JSON.stringify(jasmine_config, null, 2));
    script_regex.lastIndex = 0;
});
