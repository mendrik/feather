import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Deep property bind', () => {

    let window, feather, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    describe('Deep properties in objects', () => {

        it('Binds arrays correctly', () => {
            const inh = window.inh as demo.Inheritance
            const personDiv = document.querySelector('#person')
            const motherDiv = document.querySelector('#mother')
            const siblingDiv = document.querySelector('#sibling-names')
            expect(inh.person.siblings.length).to.be.equal(2)
            expect(inh.person.mother.siblings.length).to.be.equal(1)
            expect(personDiv.getAttribute('siblingsLength')).to.be.equal('2')
            expect(personDiv.getAttribute('uncles')).to.be.equal('1')
            expect(personDiv.textContent).to.be.equal('Andreas')
            expect(motherDiv.textContent).to.be.equal('Michaela')
            inh.person.siblings.pop()
            inh.person.mother.siblings.pop()
            expect(personDiv.getAttribute('siblingsLength')).to.be.equal('1')
            expect(personDiv.getAttribute('uncles')).to.be.equal('0')
            expect(siblingDiv.textContent).to.be.equal('Peter')
            inh.person.siblings[0].name = 'Hans'
            expect(siblingDiv.textContent).to.be.equal('Hans')
        })

        it('Binds properties correctly', () => {
            const inh = window.inh as demo.Inheritance
            const personDiv = document.querySelector('#person')
            const motherDiv = document.querySelector('#mother')
            inh.person.name = 'Peter'
            inh.person.mother.name = 'Angela'
            expect(personDiv.textContent).to.be.equal('Peter')
            expect(motherDiv.textContent).to.be.equal('Angela')
        })
    })
})
