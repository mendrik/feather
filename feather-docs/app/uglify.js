let u = require('uglify-js'),
    fs = require('fs'),
    app = fs.readFileSync('public/javascripts/app.js', 'utf-8'),
    result = u.minify({app}, {})

fs.writeFileSync('public/javascripts/docs.min.js', result.code, 'utf8')
