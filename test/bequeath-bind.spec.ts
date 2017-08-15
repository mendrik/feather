import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Bequeath', () => {

    let window, feather, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    describe('Can bind primitives', () => {

        it('should bind to children in arrays', () => {
            const app = window.app as demo.Application
            expect(app.inheritedString).to.be.equal('v1')
            const lis = document.querySelectorAll('#sorted-list > li')
            expect(lis[0].getAttribute('inherited')).to.been.equal('v1')
            expect(lis[3].getAttribute('inherited')).to.been.equal('v1')
            expect(lis[0].getAttribute('inheritedUpperCase')).to.been.equal('V1')
        })

        it('should bind to children in widgets', () => {
            const app = window.app as demo.Application
            expect(app.inheritedString).to.be.equal('v1')
            const inherit = document.querySelector('#inherit')
            expect(inherit.getAttribute('test')).to.been.equal('v1')
            expect(inherit.getAttribute('length')).to.been.equal('4')
            expect(inherit.textContent).to.been.equal('v1')
        })
    })
})
