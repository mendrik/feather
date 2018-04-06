import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Bequeath', () => {

    let window, feather, document
    before(async () => featherStart().then((w: any) => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

    describe('Can bind primitives', () => {

        it('should bind to children in arrays', () => {
            const app = window.app as demo.Application
            expect(app.inheritedString).to.be.equal('v1')
            const lis = document.querySelectorAll('#sorted-list > li')
            expect(lis[0].getAttribute('inherited')).to.been.equal('v1')
            expect(lis[3].getAttribute('inherited')).to.been.equal('v1')
            expect(lis[0].getAttribute('inheritedUpperCase')).to.been.equal('V1')
            app.inheritedString = 'v2'
            expect(lis[0].getAttribute('inherited')).to.been.equal('v2')
            expect(lis[3].getAttribute('inherited')).to.been.equal('v2')
            expect(lis[0].getAttribute('inheritedUpperCase')).to.been.equal('V2')
            app.inheritedString = 'v1'
        })

        it('should bind to children in widgets', () => {
            const app = window.app as demo.Application
            expect(app.inheritedString).to.be.equal('v1')
            const inherit = document.querySelector('#inherit')
            expect(inherit.getAttribute('test')).to.been.equal('v1')
            expect(inherit.getAttribute('length')).to.been.equal('4')
            expect(inherit.firstElementChild.textContent).to.been.equal('v1')
            app.inheritedString = 'v2'
            const ArrayElement = window.demo.ArrayElement
            app.filteredList.push(new ArrayElement(true, 'v1'))
            expect(inherit.getAttribute('test')).to.been.equal('v2')
            expect(inherit.getAttribute('length')).to.been.equal('5')
            expect(inherit.firstElementChild.textContent).to.been.equal('v2')
            app.filteredList.pop()
        })
    })
})
