const SipaCliIndexer = require('../../../bin/cli/tasks/_indexer');

describe('SipaCliIndexer', () => {
    describe('.optionDefinitions()', () => {
        it('includes indexer options', () => {
            const defs = SipaCliIndexer.optionDefinitions().map(d => d.name).sort();
            expect(defs).toEqual(['add', 'add-all', 'auto', 'dry-run', 'help', 'ignore', 'ignore-all', 'list', 'remove-missing']);
        });

        it('uses snake-case option names only', () => {
            SipaCliIndexer.optionDefinitions().forEach(def => {
                expect(def.alias).toBeUndefined();
            });
        });
    });

    describe('._parseIndices()', () => {
        it('parses comma-separated indices', () => {
            expect(SipaCliIndexer._parseIndices('1,4,5')).toEqual([1, 4, 5]);
        });

        it('returns empty array for empty string', () => {
            expect(SipaCliIndexer._parseIndices('')).toEqual([]);
        });

        it('filters invalid values', () => {
            expect(SipaCliIndexer._parseIndices('1,foo,3')).toEqual([1, 3]);
        });
    });
});
