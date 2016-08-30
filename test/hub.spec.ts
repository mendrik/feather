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
    server: Sinon.SinonFakeServer

let sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

before((done) => {
    jsdom('./test/pages/features.html', () => {
        window = jsdom.window
        document = jsdom.document
        server = jsdom.server
        done()
    })
})

describe('Hub', () => {

    describe('messages', () => {

        it('are sent and received', () => {
            let app = window['app2'],
            spy = this.sinon.spy(app, 'sendMessage'),
            spy2 = this.sinon.spy(app, 'receiveMessage'),
            spy3 = this.sinon.spy(app, 'receiveMessageFromChild')
            app.sendMessage()
            spy.should.have.been.calledOnce
            spy2.should.have.been.calledOnce
            spy2.should.have.been.calledOn(app)
            spy2.should.have.been.calledWith('down')
            spy3.should.have.been.calledOnce
            spy3.should.have.been.calledOn(app)
            spy3.should.have.been.calledWith('up')
        })
    })
})
