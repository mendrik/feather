let jsdom = require('jsdom'),
    fs = require('fs'),
    sinon = require('sinon'),
    glob = require('glob'),
    path = require('path')

module.exports = (page, ready) => {
    let htmlSource = fs.readFileSync(page, "utf8"),
        appSource = [
            fs.readFileSync("./node_modules/tslib/tslib.js", "utf8"),
            fs.readFileSync("./out/javascripts/feather.js", "utf8"),
            fs.readFileSync("./tmp/test-app.js", "utf8")
        ]

    const virtualConsole = jsdom.createVirtualConsole()
    virtualConsole.sendTo(console);

    let  mockResponse = (server, url, file) => {
        let ok = [200,  { 'Content-type': 'application/json' }, fs.readFileSync(file, "utf8")]
        server.respondWith('GET', url, ok)
        server.respondWith('POST', url, ok)
        server.respondWith('DELETE', url, ok)
        server.respondWith('PUT', url, ok)
    }

    jsdom.env({
        html: htmlSource,
        url: "http://localhost/",
        virtualConsole: virtualConsole,
        features: {
            FetchExternalResources: ['script'],
            ProcessExternalResources: ['script']
        },
        src: appSource,
        done: (errors, window) => {
            if (errors) {
                console.log('JsDom loading done with errors: ', errors)
                return
            }
            window.XMLHttpRequest = sinon.useFakeXMLHttpRequest()
            window.requestAnimationFrame = (func) => func();
            sinon.xhr.supportsCORS = true
            let server = module.exports.server = sinon.fakeServer.create({
                autoRespond: true,
                autoRespondAfter: 1
            })
            glob.sync(__dirname + '/../xhr/*.json').forEach((file) => {
                let data = path.parse(file),
                    url = '/' + data.name.replace("-", "/")
                mockResponse(server, url,  './test/xhr/' + data.base)
            })
            module.exports.window = window
            module.exports.document = window.document

            global.feather = window['feather']
            global.testApp = window['testApp']
            ready(window)
        }
    })
}

