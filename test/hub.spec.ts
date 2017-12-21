import {featherStart} from './test-head'
import * as sinon from 'sinon'
import {expect} from 'chai'

describe('Hub', () => {

    let window, feather, sandbox
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
                  proto = Object.getPrototypeOf(app1),
                  proto2 = Object.getPrototypeOf(app2),
                  spy = this.sinon.spy(proto, 'singletonEvent'),
                  spy2 = this.sinon.spy(proto, 'singletonEventNoop'),
                  spy3 = this.sinon.spy(proto2, 'receivePong')

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
                  proto = Object.getPrototypeOf(app),
                  spy = this.sinon.spy(proto, 'sendMessage'),
                  spy2 = this.sinon.spy(proto, 'receiveMessage'),
                  spy3 = this.sinon.spy(proto, 'receiveMessageFromChild')
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

        it('listener count stays stable', () => {
            const app = window.ef,
                  collect = feather.objects.collectAnnotationsFromTypeMap,
                  subs = collect(feather.hub.subscribers, app)
            let runs = 10
            expect(subs['message-down'].length).to.be.equal(1)
            expect(Object.keys(subs).length).to.be.equal(4)
            while(runs--) app.sendMessage()
            expect(subs['message-down'].length).to.be.equal(1)
            expect(Object.keys(subs).length).to.be.equal(4)
        })
    })
})
