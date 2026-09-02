const SipaCliLicense = require('../../../bin/cli/tasks/_license');

describe('SipaCliLicense', () => {
    beforeEach(() => {
        spyOn(console, 'log').and.callThrough();
    });

    it('prints JSON with --json', () => {
        SipaCliLicense.run(['--json']);
        const logged = console.log.calls.argsFor(0)[0];
        const parsed = JSON.parse(logged);
        expect(parsed.license).toBeDefined();
    });
});
