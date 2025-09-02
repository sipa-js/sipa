//----------------------------------------------------------------------------------------------------

SipaTestSpec = {};
SipaTestSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaTest', () => {
    beforeEach(() => {
        SipaTest.reset();
    });
    describe('testing mode', () => {
        it('should be disabled by default', () => {
            expect(SipaTest.isTestingMode()).toBeFalse();
        });
        it('should be enabled', () => {
            SipaTest.enableTestingMode();
            expect(SipaTest.isTestingMode()).toBeTrue();
        });
        it('should be disabled', () => {
            SipaTest.disableTestingMode();
            expect(SipaTest.isTestingMode()).toBeFalse();
        });
        it('should be disabled after enabling and disabling', () => {
            SipaTest.enableTestingMode();
            SipaTest.disableTestingMode();
            expect(SipaTest.isTestingMode()).toBeFalse();
        });
        it('should be enabled after enabling, disabling and enabling again', () => {
            SipaTest.enableTestingMode();
            SipaTest.disableTestingMode();
            expect(SipaTest.isTestingMode()).toBeFalse();
            SipaTest.enableTestingMode();
            expect(SipaTest.isTestingMode()).toBeTrue();
        });
        it('should be disabled after reset', () => {
            SipaTest.enableTestingMode();
            expect(SipaTest.isTestingMode()).toBeTrue();
            SipaTest.reset();
            expect(SipaTest.isTestingMode()).toBeFalse();
        });
    });
});

//----------------------------------------------------------------------------------------------------