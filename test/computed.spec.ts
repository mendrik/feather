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
        expect(div.textContent).to.be.equal('closed-3')
    })
})
