//----------------------------------------------------------------------------------------------------

SipaEnvSpec = {};
SipaEnvSpec.options = {};

//----------------------------------------------------------------------------------------------------

describe('SipaEnv', () => {
    beforeEach(() => {
    });
    describe('.version()', () => {
        it('should return a string', () => {
            expect(typeof SipaEnv.version()).toBe("string");
        });
        it('should return a non-empty string', () => {
            expect(SipaEnv.version().length).toBeGreaterThan(0);
        });
        it('should consist only of numbers and dots', () => {
            expect(SipaEnv.version()).toMatch(/^[0-9.]+$/);
        });
    });
    describe('.name()', () => {
        it('should return a string', () => {
            expect(typeof SipaEnv.name()).toBe("string");
        });
        it('should return a non-empty string', () => {
            expect(SipaEnv.name().trim().length).toBeGreaterThan(0);
        });
    });
    describe('.description()', () => {
        it('should return a string', () => {
            expect(typeof SipaEnv.description()).toBe("string");
        });
        it('should return a non-empty string', () => {
            expect(SipaEnv.description().trim().length).toBeGreaterThan(0);
        });
        it('should include at least 2 spaces in between', () => {
            expect(SipaEnv.description().trim().split(" ").length).toBeGreaterThan(2);
        });
    });
    describe('.isRunningLocalHost()', () => {
        it('should return a boolean', () => {
            expect(typeof SipaEnv.isRunningLocalHost()).toBe("boolean");
        });
        it('should return true when running at localhost', () => {
            expect(SipaEnv.isLocalhost("localhost")).toBeTrue();
            expect(SipaEnv.isLocalhost("https://localhost:8080")).toBeTrue();
            expect(SipaEnv.isLocalhost("http://localhost/some/path")).toBeTrue();
            expect(SipaEnv.isLocalhost("http://localhost")).toBeTrue();
        });
        it('should return true when running at 127.0.0.1', () => {
            expect(SipaEnv.isLocalhost("127.0.0.1")).toBeTrue();
            expect(SipaEnv.isLocalhost("https://127.0.0.1:8080")).toBeTrue();
            expect(SipaEnv.isLocalhost("http://127.0.0.1/some/path")).toBeTrue();
            expect(SipaEnv.isLocalhost("http://127.0.0.1")).toBeTrue();
        });
        it('should return false when running not at localhost', () => {
            expect(SipaEnv.isLocalhost("my-domain.com")).toBeFalse();
            expect(SipaEnv.isLocalhost("https://my-domain.com:8080")).toBeFalse();
            expect(SipaEnv.isLocalhost("http://my-domain.com/some/path")).toBeFalse();
            expect(SipaEnv.isLocalhost("http://my-domain.com")).toBeFalse();
            expect(SipaEnv.isLocalhost("http://mysite.local")).toBeFalse();
            expect(SipaEnv.isLocalhost("http://example.com")).toBeFalse();
        });
    });
});

//----------------------------------------------------------------------------------------------------