const SipaCliVersion = require('../../../bin/cli/tasks/_version');

describe('SipaCliVersion', () => {
    beforeEach(() => {
        spyOn(console, 'log').and.callThrough();
    });

    it('prints JSON with --json', () => {
        SipaCliVersion.run(['--json']);
        const logged = console.log.calls.argsFor(0)[0];
        const parsed = JSON.parse(logged);
        expect(parsed.name).toEqual('sipa');
        expect(parsed.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('prints full version without --json', () => {
        SipaCliVersion.run([]);
        const logged = console.log.calls.argsFor(0)[0];
        expect(logged).toContain('sipa');
    });
});
