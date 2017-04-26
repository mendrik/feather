import {document, expect, sinon, window} from './test-head';

let clock = sinon.useFakeTimers(),
    sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

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
