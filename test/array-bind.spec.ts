/// <reference path='../typings/index.d.ts' />
/// <reference path='../out/javascripts/feather.d.ts' />
/// <reference path='../tmp/test-app.d.ts' />

import chai = require('chai')
import assert = require('assert')

let expect = chai.expect,
    jsdom = require('./utils/dom.js');

let window: Window, document: Document;

before((done) => {
    jsdom('./test/pages/application.html', () => {
        window = jsdom.window
        document = jsdom.document
        done()
    })
})

describe('Array', () => {

    describe('childWidget', () => {
        it('should propagate from arrays', () => {
            let app = window['app'],
                childWidgets = app.childWidgets
            expect(childWidgets.length).to.be.equal(7)
            expect(childWidgets[0].parentWidget).to.be.equal(app)
        })

        it('should have subwidgets in arrays', () => {
            let app = window['app'],
                childWidgets = app.childWidgets
            expect(childWidgets[3].childWidgets.length).to.be.equal(1)
            expect(childWidgets[4].childWidgets.length).to.be.equal(1)
            expect(childWidgets[5].childWidgets.length).to.be.equal(1)
            expect(childWidgets[6].childWidgets.length).to.be.equal(1)
        })
    })

    describe('property', () => {

        it('prefilled array rendered', () => {
            let propertyTd = document.querySelector('.arrays .no-formatters td:first-child'),
                lis = propertyTd.querySelectorAll('li.ae')
            expect(lis.length).to.be.equal(2)
        })

        it('prefilled array rendered properties', () => {
            let firstEl = document.querySelector('.arrays .no-formatters ul.listA li.ae:first-child span'),
                secondEl = document.querySelector('.arrays .no-formatters ul.listA li.ae:nth-child(2) span')
            expect(firstEl.classList.contains('on')).to.be.true
            expect(firstEl.textContent).to.be.equal('first listCount:3')
            expect(secondEl.classList.contains('off')).to.be.true
            expect(secondEl.textContent).to.be.equal('second listCount:3')
        })

        it('prefilled array has subWidgets', () => {
            let firstSub = document.querySelector('.arrays .no-formatters ul.listA li.ae:first-child .widget'),
                secondSub = document.querySelector('.arrays .no-formatters ul.listA li.ae:nth-child(2) .widget')
            expect(firstSub.getAttribute('name')).to.be.equal('first')
            expect(firstSub.querySelector('span').textContent).to.be.equal('Widget first')
            expect(secondSub.getAttribute('name')).to.be.equal('second')
            expect(secondSub.querySelector('span').textContent).to.be.equal('Widget second')
        })
    })

    describe('attribute - filter', () => {
        it('should bind', () => {
            let propertyTd = document.querySelector('.arrays .formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('2')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('0')
        })
    })

    describe('text - filter', () => {
        it('should bind', () => {
            let propertyTd = document.querySelector('.arrays .formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: 2 yes 0 no')
        })
    })

    describe('class - filter', () => {
        it('should bind', () => {
            let propertyTd = document.querySelector('.arrays .formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('yes')).to.be.true
            expect(propertyTd.classList.contains('off')).to.be.true
        })
    })

    describe('Switch values', () => {
        it('should apply', () => {
            let arrWidget = window['app'].childWidgets.find(c => c.constructor.name === 'Arrays')
            expect(arrWidget).to.not.be.undefined
            arrWidget.listA.splice(1, 1,
                new demo.ArrayElement(true, 'third'),
                new demo.ArrayElement(true, 'forth')
            )
            arrWidget.listB.push(
                new demo.ArrayElement(false, 'fifth'),
                new demo.ArrayElement(false, 'sixth')
            )
            arrWidget.listA[0].booleanA = false
            arrWidget.listA[0].stringA = 'switched'
            expect(arrWidget.listA.length).to.be.equal(3)
            expect(arrWidget.listA[0].booleanA).to.be.false
            expect(arrWidget.listA[0].stringA).to.be.equal('switched')
            expect(arrWidget.listB.length).to.be.equal(2)
        })
    })

    describe('property - changed', () => {

        it('prefilled array rendered', () => {
            let propertyTd = document.querySelector('.arrays .no-formatters td:first-child'),
                lis1 = propertyTd.querySelectorAll('ul.listA li.ae'),
                lis2 = propertyTd.querySelectorAll('ul.listB li.ae')
            expect(lis1.length).to.be.equal(3)
            expect(lis2.length).to.be.equal(2)
        })

        it('prefilled array rendered properties', () => {
            let listASelector = '.arrays .no-formatters td:first-child .listA',
                firstEl = document.querySelector(`${listASelector} li:first-child span`),
                secondEl = document.querySelector(`${listASelector} li:nth-child(2) span`),
                thirdEl = document.querySelector(`${listASelector} li:nth-child(3) span`)
            expect(firstEl.classList.contains('on')).to.be.false
            expect(firstEl.classList.contains('off')).to.be.true
            expect(firstEl.textContent).to.be.equal('switched listCount:3')
            expect(secondEl.classList.contains('on')).to.be.true
            expect(secondEl.textContent).to.be.equal('third listCount:3')
            expect(thirdEl.classList.contains('on')).to.be.true
            expect(thirdEl.textContent).to.be.equal('forth listCount:3')
        })

        it('prefilled array has subWidgets', () => {
            let listASelector = '.arrays .no-formatters td:first-child .listA',
                firstSub  = document.querySelector(`${listASelector} li:first-child .widget`),
                secondSub = document.querySelector(`${listASelector} li:nth-child(2) .widget`),
                thirdSub  = document.querySelector(`${listASelector} li:nth-child(3) .widget`)
            expect(firstSub.getAttribute('name')).to.be.equal('first')
            expect(firstSub.querySelector('span').textContent).to.be.equal('Widget first')
            expect(secondSub.getAttribute('name')).to.be.equal('third')
            expect(secondSub.querySelector('span').textContent).to.be.equal('Widget third')
            expect(thirdSub.getAttribute('name')).to.be.equal('forth')
            expect(thirdSub.querySelector('span').textContent).to.be.equal('Widget forth')
        })
    })

    describe('attribute - filter - changed', () => {
        it('should bind', () => {
            let propertyTd = document.querySelector('.arrays .formatters td:nth-child(2)')
            expect(propertyTd.getAttribute('data-prop-a')).to.be.equal('3')
            expect(propertyTd.getAttribute('data-prop-b')).to.be.equal('2')
        })
    })

    describe('text - filter - changed', () => {
        it('should bind', () => {
            let propertyTd = document.querySelector('.arrays .formatters td:nth-child(3)')
            expect(propertyTd.textContent).to.be.equal('Text: 3 yes 2 yes')
        })
    })

    describe('class - filter - changed', () => {
        it('should bind', () => {
            let propertyTd = document.querySelector('.arrays .formatters td:nth-child(4)')
            expect(propertyTd.classList.contains('yes')).to.be.true
            expect(propertyTd.classList.contains('off')).to.be.true
        })
    })
})
