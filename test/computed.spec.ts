import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Style binding', () => {

    let window, feather, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    it('Binds computed correctly', () => {
        const inh = window.computed as demo.ComputedWidget,
              div = document.querySelector('#computed')
        expect(div.textContent.trim()).to.be.equal('CLOSED 3')
        inh.add()
        expect(div.textContent.trim()).to.be.equal('CLOSED 4')
        inh.open = true
        expect(div.textContent.trim()).to.be.equal('OPEN 4')
    })
})
