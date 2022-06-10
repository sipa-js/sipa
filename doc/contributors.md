# Contributor documentation
This documentation is for contributors and about developing the Simpartic framework itself.

For developing with the Simpartic framework, check out the developer documentation. 

## Basic setup
Run at the root directory
```
yarn install
```

## Setup development installation
To install Simpartic from this project directory to be able to use the current development state, run the following command in the project root directory:
```
yarn link_dev
```

### Uninstall
To unlink again, run the following command in the project root directory.
```
yarn unlink_dev
```

## Spec tests
Ensure, that `chrome` and `chromedriver` are installed before running the tests.

### Chrome headless
Run
```
yarn test
```

### Browser (for debug purpose)
To debug tests, run them inside a browser you like by
```
yarn test_browser
```
and then open the given link, e.g. `http://localhost:8888` inside your favorite browser.

There you are able to debug everything by using the development console.