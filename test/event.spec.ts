import {featherStart} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon';

describe('Events', () => {

    let window, feather, sandbox, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('click', () => {

        it('is received with selector', () => {
            let app = window.ef as demo.ExtraFeatures,
                child = app.childWidgets[0] as feather.core.Widget,
                i = child.element.querySelector('i'),
                event = document.createEvent("HTMLEvents"),
                spy = this.sinon.spy(child, 'click')
            event.initEvent('click', true, true)
            i.dispatchEvent(event)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(child)
            expect(spy.args[0][1]).to.be.equal(i)
        })

        // todo check this test for sanity
        it('is received on root', () => {
            let app = window.ef,
                child = app.childWidgets[0] as feather.core.Widget,
                root = child.element,
                i = root.querySelector('i'),
                event = document.createEvent("HTMLEvents"),
                spy = this.sinon.spy(child, 'clickRoot')
            event.initEvent('click', true, true)
            root.dispatchEvent(event)
            i.dispatchEvent(event)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(child)

            expect(spy.args[0][1]).to.be.equal(app.element)
        })

        // todo add tests for direct scope
    })
})
