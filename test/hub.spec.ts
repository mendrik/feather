import {chai, sinon, document, window, expect} from './test-head';

let server: sinon.SinonFakeServer

let sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

describe('Hub', () => {

    describe('messages', () => {

        it('are sent and received', () => {
            let app = window.ef,
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
