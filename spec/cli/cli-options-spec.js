const SipaCliOptions = require('../../bin/cli/_cli-options');

describe('SipaCliOptions', () => {
    it('parses known long options', () => {
        const defs = [{ name: 'type', type: String }, { name: 'name', type: String }];
        const result = SipaCliOptions.parse(defs, ['--type=page', '--name=foo-bar']);
        expect(result).toEqual({ type: 'page', name: 'foo-bar' });
    });
    it('throws on unknown options', () => {
        expect(() => SipaCliOptions.parse([{ name: 'name', type: String }], ['--unknown=value'])).toThrow();
    });
});
