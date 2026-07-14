const commandLineArgs = require('command-line-args');

class SipaCliOptions {
    static parse(definitions, argv) {
        const parser = commandLineArgs(definitions, { argv, partial: true });
        if (parser._unknown && parser._unknown.length > 0) {
            const unknown = parser._unknown
                .filter(arg => arg.startsWith('--') || arg.startsWith('-'))
                .map(arg => arg.split('=')[0].replace(/^-+/, ''));
            if (unknown.length > 0) {
                throw new Error(`Unknown option(s): ${unknown.join(', ')}`);
            }
        }
        delete parser._unknown;
        return parser;
    }
}

module.exports = SipaCliOptions;
