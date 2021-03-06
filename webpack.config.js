const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const NpmInstallPlugin = require('npm-install-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = function (env) {
    const isDevelopment = env === 'development';
    console.log(`This is a ${isDevelopment ? "development" : "production"} build`);

    const baseConfig = {
        entry: "./js/app.js",
        output: {
            path: path.resolve(__dirname + "/dist"),
            filename: "bundle.js",
            publicPath: '/dist/'
        },
        module: {
            loaders: [
                {
                    test: /\.html$/,
                    loader: 'html-loader?name=[name].[ext]'
                },
                {
                    test: /\.less$/,
                    use: [{
                        loader: "style-loader" // creates style nodes from JS strings
                    }, {
                        loader: "css-loader" // translates CSS into CommonJS
                    }, {
                        loader: "less-loader" // compiles Less to CSS
                    }]
                }
            ]
        },
        plugins: [
            new NpmInstallPlugin(),
            new CleanWebpackPlugin(['app/dist']),
            new webpack.DefinePlugin({
                ENV_IS_DEVELOPMENT: isDevelopment,
                ENV_IS: JSON.stringify(env)
            })
        ]
    };
    
    const webpackDevServer = {
        devServer: {
            contentBase: path.resolve(__dirname, ''),
            publicPath: '/dist/',
            watchContentBase: false,
            hotOnly: true,
            overlay: true,
            // proxy: {
            //     "/examples/helpers/*": {
            //         target: "http://localhost:8080"
            //     }
            // }
        },
        plugins: [
            new webpack.NamedModulesPlugin(),
            new webpack.HotModuleReplacementPlugin()
        ]
        
    };
    
    if (isDevelopment) {
        return merge(
            baseConfig,
            webpackDevServer,
            {
                devtool: 'eval-source-map'
            }
        )
    } else {
        return merge(baseConfig, {
            plugins: [
                new UglifyJsPlugin()
            ]
        });
    }
};