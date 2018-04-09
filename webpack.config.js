// File not currenctly use in the project can be deleted ay time
var webpack = require('webpack');
var path = require('path');

var APP_DIR = path.resolve(__dirname, './views');
var BUILD_DIR = path.resolve(__dirname, './views/build');

const config = {
    entry: {
        profile: APP_DIR + '/profile.jsx',
        // signup: APP_DIR + '/signup.jsx',
        // login: APP_DIR + '/login.jsx'
    },
    output: {
        filename: '[name].js',
        path: BUILD_DIR,
    },
    module: {
        rules: [
            {
                test: /(\.css|.scss)$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "sass-loader" // compiles Sass to CSS
                }]
            },
            {
                test: /\.(jsx|js)?$/,
                use: [{
                    loader: "babel-loader",
                    options: {
                        cacheDirectory: true,
                    }
                }]
            }
        ],

    }
};

module.exports = config;