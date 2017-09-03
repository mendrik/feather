import {featherStart} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon';

describe('XHR', () => {

    let window, feather, sandbox, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('App loads', () => {

        it('should show rendered', () => {
            const ef = document.querySelector('.extra-features')
            expect(ef.firstChild.textContent).to.be.equal('Rendered')
        })
    })

    describe('Rest', () => {

        it('GET fetches data', () => {
            const clock = sinon.useFakeTimers()
            const app = window.ef as demo.ExtraFeatures,
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
            const clock = sinon.useFakeTimers()
            const app = window.ef as demo.ExtraFeatures,
                  spy = this.sinon.spy(app.postData, 'original')

            var xhr = app.postData() as any
            clock.tick(2)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledWith({
                response: true,
                method: 'POST'
            })
            expect(xhr.requestBody).to.be.equal('{"test":1}')
            expect(xhr.requestHeaders).to.be.deep.equal(feather.xhr.defaultRestConfig.headers)
            expect(xhr.url).to.be.equal('/post/1')
        })
    })
})
