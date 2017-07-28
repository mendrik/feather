import {loadPage} from './test-head'
import * as sinon from 'sinon'
import {SinonSandbox} from 'sinon';

/* doesn't work with latest jsdom
const mockLocation = (window) => {
    const path = '/'
    Object.defineProperty(window.location, 'pathname', {
        value: path
    })
    // sinon.stub(window.location ,'replace').callsFake((p) => path = p)
    return true
}
*/

describe('Routes', () => {

    let window, feather, sandbox, demo
    beforeEach(done => loadPage(w => (
        window = w,
        feather = w.feather,
        demo = w.demo
    ) && done()))

    beforeEach(() => sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    it('initially', () => {
        const proto = demo.Application.prototype,
            spy = sandbox.spy(proto, 'entry');
        feather.start()
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.app)
        spy.should.have.been.calledWith({})
        spy.restore()
    })

    it('after navigation event', () => {
        const proto = demo.Application.prototype,
              spy = sandbox.spy(proto, 'entry');
        feather.start()
        window.app.route('/mypath')
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.app)
        spy.should.have.been.calledWith({})
        spy.restore()
    })
})
