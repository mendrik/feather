let u = require('uglify-js'),
    fs = require('fs'),
    libs = require('./libs'),
    replace = require("replace")

replace({
    regex: '"sourceRoot":"/"',
    replacement: '"sourceRoot":""',
    paths: ['out/javascripts/feather.js.map'],
    recursive: false,
    silent: true
});

let result = u.minify(['out/javascripts/feather.js'], {
    output: {
        preamble: fs.readFileSync("./out/javascripts/libs.min.js", "utf8")
    },
    compress: {
        drop_debugger: true,
        passes: 2
    },
    "screw-ie8": true,
    stats: true,
    inSourceMap:   'out/javascripts/feather.js.map',
    outSourceMap:  'out/javascripts/feather.min.map',
    sourceMapIncludeSources: true,
    sourceMapUrl:  'feather.min.map'
})

fs.writeFileSync('out/javascripts/feather.min.js', result.code, 'utf8')
fs.writeFileSync('out/javascripts/feather.min.map', result.map, 'utf8')

replace({
    regex: '"src/',
    replacement: '"../src/',
    paths: ['out/javascripts/feather.min.map'],
    recursive: false,
    silent: true
})

