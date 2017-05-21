let u = require('uglify-js'),
    fs = require('fs')

let feather = fs.readFileSync('./out/javascripts/feather.js', 'utf-8')

let result = u.minify({feather: feather}, {
    output: {
        preamble: fs.readFileSync("./out/javascripts/libs.min.js", "utf8")
    }
})

fs.writeFileSync('./out/javascripts/feather.min.js', result.code, 'utf8')
fs.writeFileSync('./out/javascripts/feather.min.map', result.map, 'utf8')
