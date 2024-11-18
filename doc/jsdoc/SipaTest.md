<a name="SipaTest"></a>

## SipaTest
SipaTestHelper class for testing with Sipa

* [SipaTest](#SipaTest)
    * [.enableTestingMode()](#SipaTest.enableTestingMode)
    * [.disableTestingMode()](#SipaTest.disableTestingMode)
    * [.isTestingMode()](#SipaTest.isTestingMode) &rarr; <code>boolean</code>

<a name="SipaTest.enableTestingMode"></a>

### SipaTest.enableTestingMode()
Run this before running tests. Usually this should be called in your `beforeAll()` method of your test.

        It will prepare the Sipa environment for testing.

        For example it will:
        - SipaComponent: disable performance optimized render limits per period, to ensure instant renderings for instant test runs
<a name="SipaTest.disableTestingMode"></a>

### SipaTest.disableTestingMode()
Disable testing mode.
<a name="SipaTest.isTestingMode"></a>

### SipaTest.isTestingMode() &rarr; <code>boolean</code>
Check if testing mode is enabled.
