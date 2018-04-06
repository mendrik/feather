import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Computed properties', () => {

    let window, feather, document
    before(async () => featherStart().then((w: any) => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

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
