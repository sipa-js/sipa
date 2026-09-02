const SipaCliBuild = require('../../../bin/cli/tasks/_build');

describe('SipaCliBuild', () => {
    describe('.optionDefinitions()', () => {
        it('includes build options', () => {
            const defs = SipaCliBuild.optionDefinitions().map(d => d.name).sort();
            expect(defs).toEqual(['dist-path', 'dry-run', 'help', 'no-minify-css', 'no-minify-js', 'no-remove-comments']);
        });

        it('uses snake-case option names only', () => {
            SipaCliBuild.optionDefinitions().forEach(def => {
                expect(def.alias).toBeUndefined();
            });
        });
    });
});
