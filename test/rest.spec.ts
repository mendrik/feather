/// <reference path='../typings/index.d.ts' />
/// <reference path='../out/javascripts/feather.d.ts' />
/// <reference path='../tmp/test-app.d.ts' />

import chai = require('chai')
import assert = require('assert')
import sinon = require('sinon')
import sinonChai = require('sinon-chai')

let expect = chai.expect,
    jsdom = require('./utils/dom.js');

chai.should()
chai.use(sinonChai)

let window: Window,
    document: Document,
    server: Sinon.SinonFakeServer,
    clock

let sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

before((done) => {
    clock = sinon.useFakeTimers()
    jsdom('./test/pages/features.html', () => {
        window = jsdom.window
        document = jsdom.document
        server = jsdom.server
        done()
    })
})

after(() => clock.restore())

describe('XHR', () => {

    describe('App loads', () => {

        it('should show rendered', () => {
            let app2 = document.querySelector('.extra-features')
            expect(app2.firstChild.textContent).to.be.equal('Rendered')
        })
    })

    describe('Rest', () => {

        it('GET fetches data', () => {
            let app = window['app2'],
                spy = this.sinon.spy(app.getData, 'original')
            app.getData()
            clock.tick(2)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledWith({
                response: true,
                method: 'GET'
            })
        })

        it('POST fetches data', () => {
            let app = window['app2'],
                spy = this.sinon.spy(app.postData, 'original')

            app.postData()
            clock.tick(2)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledWith({
                response: true,
                method: 'POST'
            })
        })
    })
})
