import {featherStart} from './test-head'
import {expect} from 'chai'

describe('String', () => {

    let window, feather, document
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    describe('property', () => {

        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:first-child')
            expect(propertyTd.getAttribute('stringa')).to.be.equal('first')
            expect(propertyTd.getAttribute('stringb')).to.be.equal('second')
        })
    })

    describe('attribute', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('first')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('second')
        })
    })

    describe('text', () => {

        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: first second')
        })
    })

    describe('class', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('first')).to.be.true
            expect(propertyTd.classList.contains('second')).to.be.true
        })
    })

    describe('property - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:first-child')
            expect(propertyTd.getAttribute('stringa')).to.be.equal('FIRST')
            expect(propertyTd.getAttribute('stringb')).to.be.equal('dnoces')
        })
    })

    describe('attribute - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('FIRST')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('dnoces')
        })
    })

    describe('text - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: FIRST dnoces')
        })
    })

    describe('class - filter', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('FIRST')).to.be.true
            expect(propertyTd.classList.contains('dnoces')).to.be.true
        })
    })

    describe('Switch values', () => {
        it('should apply', () => {
            const strWidget = window['app'].childWidgets.find(c => c.constructor['name'] === 'Strings') as demo.Strings
            expect(strWidget).to.not.be.undefined
            strWidget.stringA = 'changed'
            strWidget.stringB = 'switched'
            expect(strWidget.stringA).to.be.equal('changed')
            expect(strWidget.stringB).to.be.equal('switched')
        })
    })

    describe('property', () => {

        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:first-child')
            expect(propertyTd.getAttribute('stringa')).to.be.equal('changed')
            expect(propertyTd.getAttribute('stringb')).to.be.equal('switched')
        })
    })

    describe('attribute', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('changed')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('switched')
        })
    })

    describe('text', () => {

        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: changed switched')
        })
    })

    describe('class', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .no-formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('changed')).to.be.true
            expect(propertyTd.classList.contains('switched')).to.be.true
            // removed also old classes
            expect(propertyTd.classList.contains('first')).to.be.false
            expect(propertyTd.classList.contains('second')).to.be.false
        })
    })


    describe('property - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:first-child')
            expect(propertyTd.getAttribute('stringa')).to.be.equal('CHANGED')
            expect(propertyTd.getAttribute('stringb')).to.be.equal('dehctiws')
        })
    })

    describe('attribute - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('CHANGED')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('dehctiws')
        })
    })

    describe('text - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: CHANGED dehctiws')
        })
    })

    describe('class - filter - changed', () => {
        it('should bind', () => {
            const propertyTd = document.querySelector('.strings .formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('CHANGED')).to.be.true
            expect(propertyTd.classList.contains('dehctiws')).to.be.true
            // old classes have been removed
            expect(propertyTd.classList.contains('first')).to.be.false
            expect(propertyTd.classList.contains('second')).to.be.false
        })
    })

})
