/// <reference path='../typings/index.d.ts' />
/// <reference path='../out/javascripts/feather.d.ts' />
/// <reference path='../tmp/test-app.d.ts' />

import chai = require('chai')
import assert = require('assert')

let expect = chai.expect,
    jsdom = require('./utils/dom.js');

chai.should()

let window: EnrichedWindow,
    document: Document

interface EnrichedWindow extends Window {
    demo: any,
    feather: any,
}

before((done) => {
    jsdom('./test/pages/application.html', () => {
        window = jsdom.window
        document = jsdom.document
        done()
    })
})

describe('Filtered arrays', () => {

    describe('Arrays', () => {

        it('should be populated', () => {
            let app = window['app'],
                ul = document.getElementById('filtered-list')
            expect(app.filteredList.length).to.be.equal(4)
            expect(ul.children.length).to.be.equal(4)
        })

        it('should filter elements from view', () => {
            let app = window['app'],
                ul = document.getElementById('filtered-list')

            app.filterState = demo.FilterState.FALSE
            expect(ul.children.length).to.be.equal(2)
            app.filterState = demo.FilterState.TRUE
            expect(ul.children.length).to.be.equal(2)
        })

        it('should not add new child widgets', () => {
            let app = window['app']

            expect(app.filteredList[0].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[1].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[2].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[3].childWidgets.length).to.be.equal(1)
        })

        it('should apply to delegated filters', () => {
            let app = window['app'],
                ul = document.getElementById('filtered-list')

            expect(ul.getAttribute('truthy')).to.be.equal('2')
            app.filteredList[1].booleanA = true
            expect(ul.getAttribute('truthy')).to.be.equal('3')
            expect(ul.children.length).to.be.equal(3)

            app.filterState = demo.FilterState.WIDGET
            expect(ul.children.length).to.be.equal(3)
            app.filteredList[2].childWidgets[0].name = 'ItemC'
            expect(ul.children.length).to.be.equal(4)
        })

        it('can filter by subwidgets', () => {
            let app = window['app'],
                ul = document.getElementById('filtered-list')

            app.filteredList.push(new demo.ArrayElement(false, 'ObjectC'))
            expect(ul.children.length).to.be.equal(4)
            expect(app.filteredList.length).to.be.equal(5)
        })
    })
})
