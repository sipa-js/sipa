
const File = require("ruby-nice/file");

module.exports = function(config) {
  // we reuse the jasmine configuration
  const jasmine_config = JSON.parse(File.read("spec/support/jasmine-browser.json"));
  let src_dir_folder_segments = jasmine_config.srcDir.split('/').length;
  if(jasmine_config.srcDir.includes("/") === false) {
    src_dir_folder_segments = 0;
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: jasmine_config.srcDir,


    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
        ...jasmine_config.srcFiles,
      // { pattern: "**/*.json", included: false },
      // { pattern: "dict/*.*", included: false },
        ...jasmine_config.specFiles.map(f => `${"../".repeat(src_dir_folder_segments)}${jasmine_config.specDir}/${f}`)
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['ChromeHeadless'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity
  })
}
