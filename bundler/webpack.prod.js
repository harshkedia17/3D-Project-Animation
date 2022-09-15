const path=require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')

module.exports={
    mode: 'production',
    entry: path.resolve(__dirname, '../three js/script.js'),
    output:{
        filename:'script.js',
        path:path.resolve(__dirname,'../dist')
    },
    devtool: 'inline-source-map',
    plugins:
    [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../src/index.html'),
            minify: true
        }),
        new MiniCSSExtractPlugin()
    ],
    module:
    {
        rules:
        [
            {
                test: /\.(html)$/,
                use: ['html-loader']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use:
                [
                    'babel-loader'
                ]
            },
            {
                test: /\.(jpg|glb)$/,
                use:
                [
                    {
                        loader: 'file-loader',
                        options:
                        {
                            outputPath: 'assets/images/'
                        }
                    }
                ]
            }
        ]}
    }