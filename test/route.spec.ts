import {loadPage} from './test-head'
import {expect} from 'chai'
import * as sinon from "Sinon"

const mockLocation = (window) => {
    let path = '/'
    Object.defineProperty(window.location, 'pathname', {
        value: path
    })
    sinon.stub(window.location ,'replace', (p) => path = p)
    return true
}

describe('Routes', () => {

    let window, feather, sandbox, demo
    beforeEach(done => loadPage(w => (
        window = w,
        feather = w.feather,
        demo = w.demo
    ) && mockLocation(w) && done()))

    beforeEach(() => sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    it('initially', () => {
        let proto = demo.Application.prototype,
            spy = sandbox.spy(proto, 'entry');
        window.feather.start()
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.app)
        spy.should.have.been.calledWith({})
    })

    it('after navigation event', () => {
        let proto = demo.Application.prototype,
            spy = sandbox.spy(proto, 'entry');
        window.feather.start()
        window.app.route('/mypath')
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.app)
        spy.should.have.been.calledWith({})
    })

})
