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

let window: EnrichedWindow,
    document: Document,
    server: Sinon.SinonFakeServer,
    clock

interface EnrichedWindow extends Window {
    demo: any,
    feather: any,
}

before((done) => {
    clock = sinon.useFakeTimers()
    jsdom('./test/pages/features.html', () => {
        window = jsdom.window
        document = jsdom.document
        server = jsdom.server
        done()
    }, true)
})

let sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

describe('Routes', () => {
    describe('load', () => {

        it('initially', () => {
            let proto = window.demo.ExtraFeatures.prototype,
                spy2 = this.sinon.spy(proto, 'initRoutes'),
                spy = this.sinon.spy(proto, 'entry');
            window.feather.boot.WidgetFactory.start()
            let app = window['app2']

            spy2.should.have.been.calledOnce
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(app)
            spy.should.have.been.calledWith({})
        })

        it('after navigation event', () => {
            let proto = window.demo.ExtraFeatures.prototype,
                spy = this.sinon.spy(proto, 'subsection');
            let app = window['app2']
            app.route('/mypath')
            expect(document.location.pathname).to.be.equal('/mypath')

            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(app)
            spy.should.have.been.calledWith({path: 'mypath'})
        })
    })
})
