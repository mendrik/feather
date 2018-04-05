let u = require("uglify-js"),
    fs = require('fs'),
    libs = require('./libs')

let fileMap = libs.reduce((p, c) => {
  if (!fs.existsSync(c)) {
    console.log(`missing file ${c} for min.lib.js. Check lib.js`)
  } else {
    console.log(`Packing ${c} into min.lib.js`)
  }
  p[c] = fs.readFileSync(c, 'utf-8')
  return p;
} , {})

let result = u.minify(fileMap)
if (result.error) {
  console.log(result.error)
}
fs.writeFileSync('out/javascripts/libs.min.js', result.code, 'utf8')


