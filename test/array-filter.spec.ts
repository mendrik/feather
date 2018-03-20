import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Filtered arrays', () => {

    let window, feather, document, demo

    before(async () => featherStart().then(w => (
        window = w,
        feather = w.feather,
        document = w.document,
        demo = w.demo
    )))

    describe('Arrays', () => {

        it('should be populated', () => {
            const app = window.app as demo.Application,
                  ul = document.getElementById('filtered-list')
            expect(app.filteredList.length).to.be.equal(4)
            expect(ul.children.length).to.be.equal(4)
        })

        it('should filter elements from view', () => {
            const app = window.app as demo.Application,
                  ul = document.getElementById('filtered-list')

            app.filterState = demo.FilterState.FALSE
            expect(ul.children.length).to.be.equal(2)
            app.filterState = demo.FilterState.TRUE
            expect(ul.children.length).to.be.equal(2)
        })

        it('should not add new child widgets', () => {
            const app = window.app as demo.Application
            app.filterState = demo.FilterState.ALL

            expect(app.filteredList[0].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[1].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[2].childWidgets.length).to.be.equal(1)
            expect(app.filteredList[3].childWidgets.length).to.be.equal(1)
        })

        it('should apply to delegated filters', () => {
            const app = window.app as demo.Application,
                  ul  = document.getElementById('filtered-list')
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

        it('should reverse correctly', () => {
            const app = window.app as demo.Application,
                  ul  = document.getElementById('sorted-list')
            expect(ul.textContent).to.be.equal('abcd')
            app.sortTestArray.reverse()
            expect(ul.textContent).to.be.equal('dcba')
            app.sortTestArray.reverse()
            expect(ul.textContent).to.be.equal('abcd')
        })

        it('should re-add correctly', () => {
            const app = window.app as demo.Application,
                  ul  = document.getElementById('sorted-list')
            app.sortTestArray.sort((a: demo.ArrayElement, b: demo.ArrayElement) => a.stringA.localeCompare(b.stringA))
            app.sortState = demo.SortState.BOTH
            expect(ul.textContent).to.be.equal('abcd')
            expect(app.sortTestArray.map((x: demo.ArrayElement) => x.stringA).join('')).to.be.equal('abcd')
            app.sortState = demo.SortState.ON
            expect(ul.textContent).to.be.equal('ab')
            app.sortTestArray.reverse()
            expect(app.sortTestArray.map((x: demo.ArrayElement) => x.stringA).join('')).to.be.equal('dcba')
            app.sortState = demo.SortState.OFF
            expect(ul.textContent).to.be.equal('dc')
            app.sortTestArray.reverse()
            app.sortState = demo.SortState.BOTH
            expect(app.sortTestArray.map((x: demo.ArrayElement) => x.stringA).join('')).to.be.equal('abcd')
            expect(ul.textContent).to.be.equal('abcd')
        })
    })
})
