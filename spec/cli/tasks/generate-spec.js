const SipaCliGenerate = require('../../../bin/cli/tasks/_generate');

describe('SipaCliGenerate', () => {
    describe('.optionDefinitions()', () => {
        it('includes generator options', () => {
            const defs = SipaCliGenerate.optionDefinitions().map(d => d.name).sort();
            expect(defs).toEqual(['help', 'name', 'type']);
        });

        it('uses snake-case option names only', () => {
            SipaCliGenerate.optionDefinitions().forEach(def => {
                expect(def.alias).toBeUndefined();
            });
        });
    });
});
