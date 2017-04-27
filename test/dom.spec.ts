import {chai, sinon, document, window, expect} from './test-head';
before(() => window.feather.boot.WidgetFactory.start())

describe('Dom', () => {

    describe('selectorMatches', () => {

        it('should match ', () => {
            let match = feather.dom.selectorMatches;
            expect(match(document.querySelector('body'), 'body')).to.be.true;
            expect(match(document.querySelector('title'), 'li')).to.be.false;
        })
    })

    describe('querySelectorWithRoot', () => {

        it('should select root', () => {
            let bodyTag = document.body,
            select = feather.dom.querySelectorWithRoot,
                body = select(bodyTag, 'body'),
                h1s = select(bodyTag, 'h1')
            expect(Array.isArray(body)).to.be.true
            expect(body[0]).to.be.equal(bodyTag)
            expect(h1s.length).to.be.equal(3)
        })
    })
})
