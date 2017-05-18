/// <reference path='../out/javascripts/feather.d.ts' />
/// <reference path='../out/javascripts/demo.d.ts' />

let fs = require('fs'),
    jsdom = require('jsdom'),
    sinon = require('sinon'),
    glob = require('glob'),
    path = require('path')

const {JSDOM} = jsdom
const virtualConsole = new jsdom.VirtualConsole();
// virtualConsole.sendTo(console, {omitJSDOMErrors: true});

import * as chai from 'chai';

chai.should();
chai.use(require('sinon-chai'));

let mockResponse = (server, url, file) => {
    let ok = [200,  { 'Content-type': 'application/json' }, fs.readFileSync(file, 'utf8')]
    server.respondWith('GET', url, ok)
    server.respondWith('POST', url, ok)
    server.respondWith('DELETE', url, ok)
    server.respondWith('PUT', url, ok)
}

let htmlSource = fs.readFileSync('test/pages/application.html', 'utf8')

const loadPage = (callback: Function) => {

    const window = new JSDOM(htmlSource, {
        resources: 'usable',
        runScripts: 'dangerously',
        virtualConsole: virtualConsole,
        includeNodeLocations: true
    }).window;

    window.XMLHttpRequest = sinon.useFakeXMLHttpRequest()
    window.requestAnimationFrame = (func) => func();
    sinon.xhr.supportsCORS = true

    let server = module.exports.server = sinon.fakeServer.create({
        autoRespond: true,
        autoRespondAfter: 1
    })

    glob.sync(__dirname + '/xhr/*.json').forEach((file) => {
        let data = path.parse(file),
            url = '/' + data.name.replace('-', '/')
        mockResponse(server, url,  './test/xhr/' + data.base)
    })

    window.document.addEventListener('DOMContentLoaded', () => {
        if (window.document.readyState === 'complete') {
            callback(window.window);
        }
    });
}

const featherStart = (callback: Function) => {
    loadPage(window => {
        try {
            window.blockRouting = true;
            window.feather.start()
        } catch (e) {
            console.log(e);
        }
        callback(window)
    })
}

export {featherStart, loadPage}
