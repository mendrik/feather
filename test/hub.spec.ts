import {featherStart, sinon} from './test-head'

describe('Hub', () => {
    let sandbox, window, app, ef, document;

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
