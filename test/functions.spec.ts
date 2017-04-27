import {chai, sinon, document, window, expect} from './test-head';
before(() => window.feather.boot.WidgetFactory.start())

describe('Functions', () => {

    describe('isFunction', () => {

        it('() => {} should be a function', () => {
            let isFunction = feather.functions.isFunction;

            expect(isFunction(Object.defineProperty)).to.be.true
            expect(isFunction(function() {
                //
            })).to.be.true
            expect(isFunction(() => {
                //
            })).to.be.true
        })
    })

    describe('compose', () => {

        it('() => {} should be a function', () => {
            let a = (x) => x + 1,
                b = (x) => x * 2,
                c = feather.functions.compose([a, b])

            expect(c(1)).to.be.equal(4)
            expect(c(3)).to.be.equal(8)
        })
    })
})
