import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Dom', () => {

    let window, feather, document;
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    describe('selectorMatches', () => {

        it('should match ', () => {
            let match = feather.dom.selectorMatches;
            expect(match(document.querySelector('body'), 'body')).to.be.true;
            expect(match(document.querySelector('title'), 'li')).to.be.false;
        })
    })

    describe('querySelectorWithRoot', () => {

        it('should ignore document fragment root', () => {
            let bodyTag = document.createDocumentFragment(),
                select = feather.dom.querySelectorWithRoot,
                div1 = document.createElement('div'),
                div2 = document.createElement('div')
            bodyTag.appendChild(div1)
            bodyTag.appendChild(div2)
            let divs = select(bodyTag, 'div')
            expect(Array.isArray(divs)).to.be.true
            expect(divs.length).to.be.equal(2)
            expect(divs[0]).to.be.equal(div1)
            expect(divs[1]).to.be.equal(div2)
        })

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
