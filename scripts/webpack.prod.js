const webpack = require('webpack');
const extend = require('./webpack.base');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = extend({
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: false,
        }),
        new UglifyJsPlugin({
            // parallel: true,
            uglifyOptions: {
                // ecma: 8,
                ie8: false,
                warnings: true,
                mangle: false,
                compress: false,
                output: {
                    beautify: true,
                    
                }
            },
        }),
    ],
});

console.log("> Starting production build...");

webpack(config, (err, stat)=>{
    console.log("> Completed production build!");
});

