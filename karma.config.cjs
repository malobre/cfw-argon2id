const { chromium, firefox, webkit } = require('playwright');
/* global process */
process.env.CHROME_BIN = chromium.executablePath();
process.env.FIREFOX_BIN = firefox.executablePath();
process.env.WEBKIT_HEADLESS_BIN = webkit.executablePath();

/**
 * Karma does not automatically serve the bundled webworker asset generated by webpack,
 * so we need to manually reference and expose the webpack temporary output dir.
 * See: https://github.com/ryanclark/karma-webpack/issues/498#issuecomment-790040818
 */
module.exports = function(config) {
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        // basePath: '..',

        // frameworks to use
        // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
        frameworks: ['tape', 'webpack'],

        plugins: [
            'karma-tape',
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-webkit-launcher',
            'karma-webpack',
            'karma-spec-reporter',
            'karma-browserstack-launcher'
        ],

        // list of files / patterns to load in the browser
        files: [{ pattern: 'test/argon2id.spec.js', watched: false }], // blake2b tests use Buffer

        // list of files / patterns to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
        preprocessors: {
            'test/argon2id.spec.js': 'webpack'
        },


        webpack: {
            resolve: {
                fallback: {
                    stream: false,
                    buffer: false,
                },
                extensions: ['', '.js', '.json'],
            },
            module: {
                noParse: /\.wasm$/,
                rules: [
                    {
                        test: /\.wasm$/,
                        loader: 'base64-loader',
                        type: 'javascript/auto',
                    },
                    // Strip away 'tape' imports (needed for Node tests) since they cannot be compiled for the browser.
                    // Karma already takes care of setting up the corresponding test functions.
                    {
                        test: /.js$/,
                        loader: 'string-replace-loader',
                        options: {
                            search: /import\s\w*\sfrom\s'tape'/g,
                            replace: ''
                        },
                        exclude: [/node_modules/],
                    }
                ],
            },
        },

        // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
        reporters: ['spec'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        browserDisconnectTimeout: 30000,
        browserNoActivityTimeout : 180000, // ms, by default 10000
        captureTimeout: 180000, // default is 60000

        browserStack: {
            username: process.env.BROWSERSTACK_USERNAME,
            accessKey: process.env.BROWSERSTACK_ACCESS_KEY,
            build: process.env.GITHUB_SHA,
            name: process.env.GITHUB_WORKFLOW,
            project: `argon2id/${process.env.GITHUB_EVENT_NAME || 'push'}`,
            retryLimit: 1
        },

        customLaunchers: { // don't forget to pass these manually in the CI workflow
            bs_safari_13_1: { // no BigInt support
              base: 'BrowserStack',
              browser: 'Safari',
              browser_version: '13.1',
              os: 'OS X',
              os_version: 'Catalina'
            },
            bs_ios_14: {
              base: 'BrowserStack',
              device: 'iPhone 12',
              real_mobile: true,
              os: 'ios',
              os_version: '14'
            }
          },

        browsers: ['ChromeHeadless', 'FirefoxHeadless', 'WebkitHeadless'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser instances should be started simultaneously
        concurrency: Infinity,
    });
}
