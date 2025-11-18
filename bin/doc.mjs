/**
 * documentation generation script (ESM version)
 */

import File from 'ruby-nice/file';
import { execSync } from 'child_process';

import 'ruby-nice/array';
import 'lucky-case/string';

const files_to_doc = [
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
]

function generateDoc() {
    for(let source_file of files_to_doc) {
        const doc_file = './doc/jsdoc/' + source_file.split('/').getLast().toPascalCase().replace(/\.js$/gm,'.md');
        execSync(`./node_modules/jsdoc-to-markdown/bin/cli.js --files ${source_file} > ${doc_file}`);
        beautifyDoc(doc_file);
    }
}

function beautifyDoc(file) {
    const kind_line_regex = /^[\n\r]\*\*Kind[^\n\r]*[\n\r]/gms;
    const arrow_right_char_regex = /⇒/g;
    const class_name = file.split('/').getLast().split('.').getFirst().toPascalCase();
    const function_description_regex = new RegExp(`## Classes.*<a name="${class_name}"><\/a>`, 'gms');
    let data = File.read(file);
    const first_method_name_match = data.match((new RegExp(`<a name="${class_name}\\+([^"]+)"><\/a>`,'')));
    const first_method_name = first_method_name_match && first_method_name_match[1] ? first_method_name_match[1] : null;
    data = data.replace(kind_line_regex,'');
    data = data.replace(/^\*\*Example\*\*\s*$/gm,"\n**Example**");
    data = data.replace(/^\*\*Returns\*\*/gm,"\n**Returns**");
    data = data.replace(arrow_right_char_regex,'&rarr;');
    data = data.replace(function_description_regex,'<a name="String"></a>');
    if(first_method_name) {
        const functions_regex = new RegExp(`<a name="${first_method_name}"><\/a>.*`,'gms');
        data = data.replace(functions_regex,'');
    }
    File.write(file, data);
}

console.log("Generate documentation ...");
generateDoc();

