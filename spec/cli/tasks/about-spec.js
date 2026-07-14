const SipaCliAbout = require('../../../bin/cli/tasks/_about');

describe('SipaCliAbout', () => {
    beforeEach(() => {
        spyOn(console, 'log').and.callThrough();
    });

    it('prints JSON with --json', () => {
        SipaCliAbout.run(['--json']);
        const logged = console.log.calls.argsFor(0)[0];
        const parsed = JSON.parse(logged);
        expect(parsed.name).toEqual('sipa');
        expect(parsed.description).toContain('web framework');
        expect(parsed.homepage).toContain('github.com');
    });
});
