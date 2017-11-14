var webpack = require('webpack');
var extend = require('./webpack.base');
var shell = require('shelljs');
var package = require('./../package.json');

////////////////////////////////////////////////////////////////////////
//====================================================================//
////////////////////////////////////////////////////////////////////////
//====================================================================//
////////////////////////////////////////////////////////////////////////

let config = extend({
    entry: './src/test.js',
    output: {
        path: __dirname + './../dist',
        filename: 'dev.bundle.js',
        library: package.name,
        libraryTarget: 'umd',
    },
    externals: Object.keys(package.dependencies||[]).reduce((a, d) => {
        // adds all runtime dependencies to the exclude list for testing
        // in a node environment for accurate code coverage reporting.
        a[d] = d;
        return a;
    }, { tap: 'tap' }),
    devtool: 'cheap-source-map',
});

////////////////////////////////////////////////////////////////////////
//====================================================================//
////////////////////////////////////////////////////////////////////////
//====================================================================//
////////////////////////////////////////////////////////////////////////

let compiler = webpack(config);

compiler.watch({
    aggregateTimeout: 500, 
    poll: 3000,
}, (err, stat) =>{
    console.log(err !== null ? err : '> running bundle...');
    try {
        shell.exec('node ./dist/dev.bundle.js');
    } catch(err){
        console.error(err);
    }
});
