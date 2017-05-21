let UglifyJS = require("uglify-js"),
    fs = require('fs'),
    libs = require('./libs')

let fileMap = libs.reduce((p, c) => {
  p[c] = fs.readFileSync(c, 'utf-8')
  return p;
} , {})

let result = UglifyJS.minify(fileMap)

fs.writeFileSync('out/javascripts/libs.min.js', result.code, 'utf8')


