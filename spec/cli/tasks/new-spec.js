const SipaCliNew = require('../../../bin/cli/tasks/_new');

describe('SipaCliNew', () => {
    describe('.optionDefinitions()', () => {
        it('includes all new project options', () => {
            const defs = SipaCliNew.optionDefinitions().map(d => d.name).sort();
            expect(defs).toEqual(['author', 'email', 'help', 'name', 'type', 'version']);
        });

        it('uses snake-case option names only', () => {
            SipaCliNew.optionDefinitions().forEach(def => {
                expect(def.alias).toBeUndefined();
            });
        });
    });
});
