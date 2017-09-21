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
            const inh = window.inh as demo.Inheritance,
                  app = window.app as demo.Application,
                  personDiv = document.querySelector('#person'),
                  motherDiv = document.querySelector('#mother'),
                  siblingDiv = document.querySelector('#sibling-names'),
                  inheritedObjDiv = document.querySelector('#inherited-object')
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
            expect(inheritedObjDiv.getAttribute('fullName')).to.be.equal('Gandalf the Wise')
            expect(inheritedObjDiv.textContent.trim()).to.be.equal('Gandalf the Wise')
            app.inheritedObject.fullname.name = 'Dumbledore'
            expect(inheritedObjDiv.getAttribute('fullName')).to.be.equal('Dumbledore the Wise')
            expect(inheritedObjDiv.textContent.trim()).to.be.equal('Dumbledore the Wise')
            app.inheritedObject = {
                fullname: {
                    name: 'Merlin',
                    surname: 'the Cunning'
                }
            }
            expect(inheritedObjDiv.getAttribute('fullName')).to.be.equal('Merlin the Cunning')
            expect(inheritedObjDiv.textContent.trim()).to.be.equal('Merlin the Cunning')
        })

        it('Binds properties correctly', () => {
            const inh = window.inh as demo.Inheritance
            const personDiv = document.querySelector('#person')
            const motherDiv = document.querySelector('#mother')
            inh.person.name = 'Peter'
            inh.person.mother.name = 'Angela'
            expect(personDiv.textContent).to.be.equal('Peter')
            expect(motherDiv.textContent).to.be.equal('Angela')
            inh.person.mother.name = 'Michaela'
        })

        it('Binds properties with transformers correctly', () => {
            const inh = window.inh as demo.Inheritance
            const motherDiv = document.querySelector('#mother')
            expect(motherDiv.getAttribute('uppercase')).to.be.equal('MICHAELA')
            expect(motherDiv.getAttribute('uppercaseMothersName')).to.be.equal('MICHAELA')
            inh.person.mother.name = 'Angela'
            expect(motherDiv.getAttribute('uppercase')).to.be.equal('ANGELA')
            expect(motherDiv.getAttribute('uppercaseMothersName')).to.be.equal('ANGELA')
            inh.person.mother.name = 'Michaela'
        })

        it('Binds bequeathed properties with transformers correctly', () => {
            const app = window.app as demo.Application
            const motherDiv = document.querySelector('#aunt')
            expect(motherDiv.getAttribute('uppercase')).to.be.equal('GRAND MAY')
            expect(motherDiv.getAttribute('uppercaseMothersName')).to.be.equal('GRAND MAY')
            app.aunt.mother.name = 'June'
            expect(motherDiv.getAttribute('uppercase')).to.be.equal('JUNE')
            expect(motherDiv.getAttribute('uppercaseMothersName')).to.be.equal('JUNE')
            app.aunt.mother.name = 'Grand May'
        })
    })
})
