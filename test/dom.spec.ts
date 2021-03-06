import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Dom', () => {

    let window, feather, document
    before(async () => featherStart().then((w: any) => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

    describe('selectorMatches', () => {

        it('should match ', () => {
            const match = feather.dom.selectorMatches
            expect(match(document.querySelector('body'), 'body')).to.be.true
            expect(match(document.querySelector('title'), 'li')).to.be.false
        })
    })
})
