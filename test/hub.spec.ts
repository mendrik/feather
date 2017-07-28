import {featherStart} from './test-head'
import * as sinon from 'sinon'
import {expect} from 'chai'

describe('Hub', () => {

    let window, feather, sandbox;
    before(done => featherStart(w => (
        window = w,
        feather = w.feather
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('messages', () => {

        it('are sent and received by singletons', () => {
            const app2 = window.ef as demo.ExtraFeatures,
                  app1 = window.app as demo.Application,
                  spy = this.sinon.spy(app1, 'singletonEvent'),
                  spy2 = this.sinon.spy(app1, 'singletonEventNoop'),
                  spy3 = this.sinon.spy(app2, 'receivePong')

            app2.notifySingleton()
            spy.should.have.been.calledOnce
            spy.should.have.been.calledWith('data')
            spy.should.have.been.calledOn(app1)
            expect(spy2.callCount).to.be.equal(0)
            spy3.should.have.been.calledOnce
            spy3.should.have.been.calledWith('data')
            spy3.should.have.been.calledOn(app2);

            [spy, spy2, spy3].forEach(s => s.restore())
        })

        it('are sent and received', () => {
            const app = window.ef,
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
            spy3.should.have.been.calledWith('up');

            [spy, spy2, spy3].forEach(s => s.restore())
        })
    })
})
