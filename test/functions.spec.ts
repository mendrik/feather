import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Functions', () => {

    let window, feather
    before(async () => featherStart().then(w => (
        window = w,
        feather = w.feather
    )))

    describe('isFunction', () => {

        it('() => {} should be a function', () => {
            const isFunction = feather.functions.isFunction

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
            const a = (x) => x + 1,
                  b = (x) => x * 2,
                  c = feather.functions.compose([a, b])

            expect(c(1)).to.be.equal(4)
            expect(c(3)).to.be.equal(8)
        })
    })
})
