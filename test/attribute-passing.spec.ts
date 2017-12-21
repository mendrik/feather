import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Pass objects via attributes {}', () => {

    let window, document
    before(done => featherStart(w => (
        window = w,
        document = w.document
    ) && done()))

    it('Binds different types correctly', () => {
        const aw1 = document.querySelector('#aw1 span'),
              aw2 = document.querySelector('#aw2 span'),
              app = window.app as demo.Application,
              w1 = app.childWidgets[1] as demo.AttributeWidget,
              w2 = app.childWidgets[2] as demo.AttributeWidget

        expect(aw1.getAttribute('bool')).to.be.equal('yes')
        expect(aw2.getAttribute('bool')).to.be.equal('no')
        expect(aw1.getAttribute('number')).to.be.equal('4')
        expect(aw2.getAttribute('number')).to.be.equal('5')
        expect(aw1.getAttribute('text')).to.be.equal('ab')
        expect(aw2.getAttribute('text')).to.be.equal('parent-text')
        expect(aw1.getAttribute('func')).to.be.equal('parent-text')
        expect(aw2.getAttribute('func')).to.be.equal('parent-text')
        expect(w1.bool).to.be.equal(true)
        expect(w2.bool).to.be.equal(false)
        expect(w1.number).to.be.equal(4)
        expect(w2.number).to.be.equal(5)
    })
})
