import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Booleans', () => {

    let window, feather, document
    before(async () => featherStart().then(w => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

    describe('property', () => {

        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .no-formatters td:first-child')
            expect(propertyTd.getAttribute('booleana')).to.not.be.null
            expect(propertyTd.getAttribute('booleanb')).to.be.null
        })
    })

    describe('attribute', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .no-formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.not.be.null
            expect(propertyTd.getAttribute('booleanb')).to.be.null
        })
    })

    describe('property - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:first-child')
            expect(propertyTd.getAttribute('booleana')).to.be.equal('selected')
            expect(propertyTd.getAttribute('booleanb')).to.be.null
        })
    })

    describe('attribute - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('yes')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('false')
        })
    })

    describe('text - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: yes false')
        })
    })

    describe('class - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('selected')).to.be.true
        })
    })

    describe('Switch values', () => {
        it('should apply', () => {
            const boolWidget = window.app.childWidgets.find(c => c.constructor['name'] === 'Booleans') as demo.Booleans
            expect(boolWidget).to.not.be.undefined
            boolWidget.booleanA = false
            boolWidget.booleanB = true
            expect(boolWidget.booleanA).to.be.false // defineProperty test
            expect(boolWidget.booleanB).to.be.true
        })
    })

    describe('property - changed', () => {

        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .no-formatters td:first-child')
            expect(propertyTd.getAttribute('booleana')).to.be.null
            expect(propertyTd.getAttribute('booleanb')).to.not.be.null
        })
    })

    describe('attribute - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .no-formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.null
            expect(propertyTd.getAttribute('data-prop-b')).to.not.be.null
        })
    })

    describe('property - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:first-child')
            expect(propertyTd.getAttribute('selected')).to.be.null
        })
    })

    describe('attribute - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('no')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('true')
        })
    })

    describe('text - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: no true')
        })
    })

    describe('class - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.booleans .formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('selected')).to.be.false
        })
    })
})
