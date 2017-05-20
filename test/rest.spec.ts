import {featherStart} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon';

describe('XHR', () => {

    let window, feather, clock = sinon.useFakeTimers(), sandbox, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())
    after(() => clock.restore())

    describe('App loads', () => {

        it('should show rendered', () => {
            let ef = document.querySelector('.extra-features')
            expect(ef.firstChild.textContent).to.be.equal('Rendered')
        })
    })

    describe('Rest', () => {

        it('GET fetches data', () => {
            let app = window.ef as demo.ExtraFeatures,
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
            let app = window.ef as demo.ExtraFeatures,
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
