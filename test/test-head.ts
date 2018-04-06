/// <reference path='../out/javascripts/feather.d.ts' />
/// <reference path='../out/javascripts/demo.d.ts' />

const fs = require('fs'),
      jsdom = require('jsdom'),
      sinon = require('sinon'),
      glob = require('glob'),
      path = require('path')

const {JSDOM} = jsdom
const virtualConsole = new jsdom.VirtualConsole()
virtualConsole.sendTo(console, {omitJSDOMErrors: true})

import * as chai from 'chai'

chai.should()
chai.use(require('sinon-chai'))

const mockResponse = (server, url, file) => {
    const ok = [200,  { 'Content-type': 'application/json' }, fs.readFileSync(file, 'utf8')]
    server.respondWith('GET', url, ok)
    server.respondWith('POST', url, ok)
    server.respondWith('DELETE', url, ok)
    server.respondWith('PUT', url, ok)
}

const htmlSource = fs.readFileSync('test/pages/application.html', 'utf8')

const loadPage = () => new Promise((resolve, reject) => {

    const dom = new JSDOM(htmlSource, {
        resources: 'usable',
        runScripts: 'dangerously',
        virtualConsole: virtualConsole,
        includeNodeLocations: true
    })

    const window = dom.window


    window.XMLHttpRequest = sinon.useFakeXMLHttpRequest()
    window.requestAnimationFrame = (func) => func()
    sinon.xhr.supportsCORS = true

    window['localStorage'] = {
        getItem: (key: string) => this[key],
        setItem: (key: string, val: any) => this[key] = val
    }

    window['matchMedia'] = (query: string) => ({
        addListener: () => 0
    })

    window.document.requestAnimationFrame = (fn) => fn()

    window.document.createRange = () => ({
        createContextualFragment: (source) => {
            const doc = window.document,
                  template = doc.createElement('template')
            template.innerHTML = source
            return doc.importNode((template as any).content, true)
        }
    })

    const server = module.exports.server = sinon.fakeServer.create({
        autoRespond: true,
        autoRespondAfter: 1
    })

    glob.sync(__dirname + '/xhr/*.json').forEach((file) => {
        const data = path.parse(file),
              url = '/' + data.name.replace('-', '/')
        mockResponse(server, url,  './test/xhr/' + data.base)
    })

    window.document.addEventListener('DOMContentLoaded', () => {
        if (window.document.readyState === 'complete') {
            dom.reconfigure({ url: 'https://example.com/' })
            resolve(window.window)
        }
    })
})

const featherStart = async () => loadPage().then((window: any) => {
    try {
        window.blockRouting = true
        window.feather.start()
    } catch (e) {
        console.log(e)
    }
    return window
})

export {featherStart, loadPage}
