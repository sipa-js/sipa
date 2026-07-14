const SipaCliServer = require('../../../bin/cli/tasks/_server');

describe('SipaCliServer', () => {
    describe('.optionDefinitions()', () => {
        it('includes server options', () => {
            const defs = SipaCliServer.optionDefinitions().map(d => d.name).sort();
            expect(defs).toEqual(['help', 'host', 'mount', 'no-open', 'port']);
        });

        it('uses snake-case option names only', () => {
            SipaCliServer.optionDefinitions().forEach(def => {
                expect(def.alias).toBeUndefined();
            });
        });
    });
});
