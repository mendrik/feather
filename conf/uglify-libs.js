let u = require('uglify-js'),
    fs = require('fs'),
    libs = require('./libs')

let result = u.minify(libs)

fs.writeFileSync(__dirname + '/out/javascripts/libs.min.js', result.code, 'utf8')


