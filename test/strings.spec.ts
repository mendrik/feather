import {featherStart} from './test-head'
import {expect} from 'chai'

describe('String Utils', () => {

    let window, feather
    before(done => featherStart(w => (
        window = w,
            feather = w.feather
    ) && done()))

    describe('format', () => {

        it('should replace token at beginning', () => {
            const s = feather.strings,
                str = '{{test}} hello'
            expect(s.format(str, {test: 'world'})).to.be.equal('world hello')
        })

        it('should replace simple tokens', () => {
            const s = feather.strings,
                str = 'hello {{test}}'
            expect(s.format(str, {test: 'world'})).to.be.equal('hello world')
        })

        it('should replace deep values', () => {
            const s = feather.strings,
                str = 'hello {{test.me}}'
            expect(s.format(str, {test: {me: 'world'}})).to.be.equal('hello world')
        })

    })
})
