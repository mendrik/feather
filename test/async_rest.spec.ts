import {featherStart} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon'

describe('XHR', () => {

    let window, feather, sandbox, document
    before(async () => featherStart().then((w: any) => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('App loads', () => {

        it('should show rendered', () => {
            const ef = document.querySelector('.extra-features')
            expect(ef.firstChild.textContent).to.be.equal('Rendered')
        })
    })

    describe('Rest', () => {

        it('GET fetches data', async () => {
            const app = window.ef as demo.ExtraFeatures,
                  spy = this.sinon.spy(app.getData, 'original')
            const data = await app.getData()
            spy.should.have.been.calledOnce
            expect(data).to.be.deep.equal({
                response: true,
                method: 'GET'
            })
        })

        it('POST fetches data', async () => {
            const app = window.ef as demo.ExtraFeatures
            const spy = this.sinon.spy(app.postData, 'original')
            const data = await app.postData()
            spy.should.have.been.calledOnce
            expect(data).to.be.deep.equal({
                response: true,
                method: 'POST'
            })
        })
    })
})
