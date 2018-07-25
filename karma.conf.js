/**
 * Created by maciejjaskula on 29.04.2018.
 */
module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine', 'sinon-chai'],

        //chai config
        client: {
            chai: {
                includeStack: true
            }
        },

        files: [
            //{ pattern: 'test-context.js', watched: false },
            './test/*.spec.js',
            {pattern: './node_modules/underscore/underscore.js', included: true},
            {pattern: './node_modules/jquery/dist/jquery.js', included: true},
            {pattern: './node_modules/backbone/backbone.js', included: true},
            {pattern: './node_modules/sinon/pkg/sinon.js', included: true},
            {pattern: './node_modules/chai/chai.js', included: true},
            {pattern: './js/BackboneViewStructure.js', included: true}
        ],
        // preprocessors: {
        //     'test-context.js': ['webpack']
        // },
        // webpack: {
        //     module: {
        //         loaders: [
        //             { test: /\.js/, exclude: /node_modules/, loader: 'babel-loader' }
        //         ]
        //     },
        //     watch: true
        // },
        // webpackServer: {
        //     noInfo: true
        // },

        autoWatch: true,

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        browsers: [
            'Chrome'
        ],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-sinon-chai')
        ]
    })
}