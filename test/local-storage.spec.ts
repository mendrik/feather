import {featherStart} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon'


describe('Local storage', () => {

    let window, feather, document, sandbox
    const clock = sinon.useFakeTimers()
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore() && clock.restore())

/*  todo figure out how to fix timeout
    it('Serializes values', () => {
        const inh = window.inh as demo.Inheritance,
            spy =  this.sinon.spy(inh, 'write'),
            test = {name: 'Peter Pan'};
        inh.people.push(test)
        clock.tick(100)
        spy.should.have.been.calledOnce
        spy.should.have.been.calledWith(test)
        const p = JSON.parse(window.localStorage.getItem('Application.Inheritance.people'))
        expect(p.value).to.be.deep.equal([test])
    })
*/

    // todo: deserialize

})
