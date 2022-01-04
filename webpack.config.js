const path = require('path')

module.exports = {
    mode: "production",
    entry: {
        fakeMediaDevices: "./lib/fakeMediaDevices.ts"
    },
    output: {
        devtoolNamespace: 'fakeMediaDevices',
        path: path.join(__dirname, 'dist'),
            library: '[name]',
            libraryTarget: 'umd',
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.mp3$/,
                use: 'arraybuffer-loader',
                exclude: /node_modules/,
            },
        ]
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js' ],
    },
    plugins: [
    ],
}