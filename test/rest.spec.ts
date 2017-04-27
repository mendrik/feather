import {expect, featherStart, sinon} from './test-head'

describe('XHR', () => {
    let sandbox, window, app, ef, document, clock = sinon.useFakeTimers();

    before(done => {
        featherStart(r => {
            window = r.window
            document = r.window.document
            app = r.app
            ef = r.ef
        });
        done()
    })

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
            let app = window.ef,
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
            let app = window.ef,
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
