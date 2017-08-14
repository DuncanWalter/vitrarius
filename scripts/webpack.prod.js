const webpack = require('webpack');
const extend = require('./webpack.base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = extend({
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false,
        }),
        new UglifyJsPlugin({
            parallel: true,
            uglifyOptions: {
                ecma: 8,
                ie8: false,
                warnings: true,
                mangle: true,
                compress: true,
                comments: false,
            },
        }),
    ],
});

console.log("> Starting production build...");

webpack(config, (err, stat)=>{
    console.log("> Completed production build!");
});

