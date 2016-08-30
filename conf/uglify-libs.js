let u = require('uglify-js'),
    fs = require('fs'),
    libs = require('./libs')

let result = u.minify(libs)

fs.writeFileSync('out/javascripts/libs.min.js', result.code, 'utf8')


