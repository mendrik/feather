import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Filtered arrays', () => {

    let window, feather, document, demo
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document,
        demo = w.demo
    ) && done()))

    describe('Arrays', () => {

        it('should be populated', () => {
            let app = window.app as demo.Application,
                ul = document.getElementById('filtered-list')
            expect(app.filteredList.length).to.be.equal(4)
            expect(ul.children.length).to.be.equal(4)
        })

        it('should filter elements from view', () => {
            let app = window.app as demo.Application,
                ul = document.getElementById('filtered-list')

            app.filterState = demo.FilterState.FALSE
            expect(ul.children.length).to.be.equal(2)
            app.filterState = demo.FilterState.TRUE
            expect(ul.children.length).to.be.equal(2)
        })

        it('should not add new child widgets', () => {
            let app = window.app as demo.Application
            app.filterState = demo.FilterState.ALL

            expect(app.filteredList[0].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[1].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[2].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[3].childWidgets.length).to.be.equal(1)
        })

        it('should apply to delegated filters', () => {
            let app = window.app as demo.Application,
                ul = document.getElementById('filtered-list')
            app.filterState = demo.FilterState.TRUE
            expect(ul.getAttribute('truthy')).to.be.equal('2')
            app.filteredList[1].booleanA = true
            expect(ul.getAttribute('truthy')).to.be.equal('3')
            expect(ul.children.length).to.be.equal(3)

            app.filterState = demo.FilterState.WIDGET
            expect(ul.children.length).to.be.equal(3)
            app.filteredList[2].childWidgets[0]['name'] = 'ItemC'
            expect(ul.children.length).to.be.equal(4)
        })
    })
})
