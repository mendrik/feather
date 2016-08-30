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

describe('Events', () => {

    describe('click', () => {

        it('is received with selector', () => {
            let app = window['app2'],
                child = app.childWidgets[0],
                i = document.querySelector('i'),
                event = new (window as any).MouseEvent('click'),
                spy = this.sinon.spy(child, 'click')

            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null)
            i.dispatchEvent(event)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(child)
            expect(spy.args[0][1]).to.be.equal(i)
        })

        it('is received on root', () => {
            let app = window['app2'],
                child = app.childWidgets[0],
                root = child.element,
                i = document.querySelector('i'),
                event = new (window as any).MouseEvent('click'),
                spy = this.sinon.spy(child, 'clickRoot')
            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null)
            root.dispatchEvent(event)
            i.dispatchEvent(event)
            spy.should.have.been.calledTwice
            spy.should.have.been.calledOn(child)

            expect(spy.args[0][1]).to.be.equal(root)
            expect(spy.args[1][1]).to.be.equal(i)
        })
    })
})
