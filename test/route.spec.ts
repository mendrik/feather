import {loadPage} from './test-head'
import * as sinon from 'sinon'

describe('Routes', () => {

    let window, feather, sandbox, demo
    beforeEach(async () => loadPage().then((w: any) => (
        window = w,
        feather = w.feather,
        demo = w.demo
    )))

    beforeEach(() => sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    it('initially', () => {
        const proto = demo.Application.prototype,
            spy = sandbox.spy(proto, 'entry')
        feather.start()
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.app)
        spy.should.have.been.calledWith({})
    })

    it('after navigation event', () => {
        const proto = demo.Application.prototype,
              spy = sandbox.spy(proto, 'entry')
        feather.start()
        window.app.route('/mypath')
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.app)
        spy.should.have.been.calledWith({})
    })
})
