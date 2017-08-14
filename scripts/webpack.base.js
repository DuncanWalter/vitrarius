// TODO magic with package json to exclude other client templates

const base = {
    entry: './src/index.js',
    output: {
        path: __dirname + './../dist',
        filename: 'index.bundle.js',
        library: 'vitrarius',
        libraryTarget: 'umd',
    },
    module: { 
        rules: [{
            test: /\.js$/,
            exclude: /node_modules\//,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [['env', {
                        targets: {
                            browsers: [
                                '> 5%',
                            ],
                            node: 'current',
                        }
                        
                    }]],
                    cacheDirectory: true,
                }
            }],
        }],
    },
    resolve:{
        alias: {
            '~': __dirname + './../',
        },
    },
};

module.exports = function(ext){
    // mixin the base config underneath the dev config object
    return Object.keys(base).reduce((acc, key) => {
        acc[key] = acc[key] === undefined ? base[key] : acc[key];
        return acc;
    }, ext);
};