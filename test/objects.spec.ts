import {loadPage} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon'

describe('Objects', () => {

    let window, feather, sandbox
    before(done => loadPage(w => (
        window = w,
        feather = w.feather
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('isObject', () => {

        it('{} should be an object', () => {
            const isObject = feather.objects.isObject

            expect(isObject({})).to.be.true
            expect(isObject(Object.create(null))).to.be.true
            expect(isObject([])).to.be.false
            expect(isObject(new Date())).to.be.false
            expect(isObject(/.*/i)).to.be.false
            expect(isObject(true)).to.be.false
            expect(isObject('Test')).to.be.false
            expect(isObject(3)).to.be.false
        })
    })

    describe('values', () => {

        it('Should collect values', () => {
            const values = feather.objects.values,
                test = {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        a: 1,
                        b: 2
                    }
                }
            expect(values(test)).to.be.deep.equal([1,2,3, {a: 1, b: 2}])
        })
    })

    describe('deep value', () => {

        it('Should resolve deep values', () => {
            const deepValue = feather.objects.deepValue,
                setDeepValue = feather.objects.setDeepValue,
                test = {
                    a: 1,
                    b: 2,
                    c: 3,
                    d: {
                        a: 4,
                        b: 5,
                    },
                    f: () => 5
                }
            expect(deepValue(test, 'a')).to.be.equal(1)
            expect(deepValue(test, 'e')).to.be.undefined
            expect(deepValue(test, 'd')).to.be.deep.equal({a: 4,  b: 5})
            expect(deepValue(test, 'd.a')).to.be.equal(4)
            expect(deepValue(test, 'd.c')).to.be.undefined
            expect(deepValue(test, 'f')).to.be.equal(5)

            setDeepValue(test, 'a', 9)
            setDeepValue(test, 'd.b', 10)
            expect(deepValue(test, 'a')).to.be.equal(9)
            expect(deepValue(test, 'd.b')).to.be.equal(10)
            const test2 = {}
            setDeepValue(test2, 'a.b.c', 10)
            expect(deepValue(test2, 'a')).to.not.be.undefined
            expect(deepValue(test2, 'a.b')).to.not.be.undefined
            expect(deepValue(test2, 'a.b.c')).to.be.equal(10)

        })
    })

    describe('Observe object property', () => {

        interface City {
            plc: number
            name: string
        }

        interface Address {
            street: string
            home: boolean
            city: City
        }

        interface User {
            name: string
            mainAddress: Address
            additional: Address[]
        }

        const city1: City = {
            plc: 510,
            name: 'Helsinki'
        }

        const city2: City = {
            plc: 570,
            name: 'Turku'
        }

        const address1: Address = {
            street: 'Mannerheimhintie 13 A',
            home: true,
            city: city1
        }

        const address2: Address = {
            street: 'Sturenkatu 17',
            home: false,
            city: city2
        }

        const user: User = {
            name: 'Matti Mattison',
            mainAddress: address1,
            additional: []
        }

        class Test {
            constructor(public user?: User) {}
            callback () {
                // ignore
            }
            callback2 () {
                // ignore
            }
            callback3 () {
                // ignore
            }
        }

        it('Should trigger callback', () => {
            const clock = sinon.useFakeTimers()
            const test = new Test()
            const observe = feather.objects.createObjectPropertyListener
            expect(test.user).to.be.undefined
            const spy = this.sinon.spy(test, 'callback')
            const spy2 = this.sinon.spy(test, 'callback2')
            const spy3 = this.sinon.spy(test, 'callback3')
            observe(test, 'user.name', test.callback)
            observe(test, 'user.mainAddress.city.plc', test.callback2)
            observe(test, 'user.additional', test.callback3)
            clock.tick(2)
            test.user = user
            expect(test.user).to.not.be.undefined
            spy.should.have.been.calledOnce
            spy.reset()

            const newName = 'Peter Peterson'
            test.user.name = newName
            spy.should.have.been.calledOnce
            expect(test.user.name).to.be.equal(newName)
            spy.reset()

            test.user.mainAddress.city.plc = 600
            spy2.should.have.been.calledTwice
            spy2.reset()

            test.user.mainAddress.city = city2
            spy2.should.have.been.calledOnce
            spy2.reset()

            test.user.mainAddress.city.plc = 700
            spy2.should.have.been.calledOnce
            spy2.reset()

            test.user.additional.push(address1)
            spy3.should.have.been.calledTwice
            spy3.reset()

            test.user.additional = []
            spy3.should.have.been.calledOnce
            spy3.reset()

            test.user.additional.push(address2)
            spy3.should.have.been.calledOnce
            spy3.reset()

            test.user.additional[0].city = city1
            spy3.should.have.been.calledOnce
            spy3.reset()

            test.user.additional[0].city.plc = 900
            spy3.should.have.been.calledOnce
            spy3.reset()
            clock.restore()
        })

        it('Can have multiple listeners', () => {
            const clock = sinon.useFakeTimers()
            const test = new Test()
            const observe = feather.objects.createObjectPropertyListener
            expect(test.user).to.be.undefined
            const spy = this.sinon.spy(test, 'callback')
            observe(test, 'user', test.callback)
            observe(test, 'user', test.callback)
            clock.tick(1)
            test.user = user
            spy.should.have.been.calledTwice
            spy.reset()
            clock.restore()
        })

        it('MergeArrayTypedMap', () => {
            const merge = feather.objects.merge
            const a = {a: 1, b: 2}
            const b = {c: 3, d: 4}
            merge(a, b)
            expect(a).to.be.deep.equal({a: 1, b: 2, c: 3, d: 4})

            const c = {a: [1,2], b: [1,2]}
            const d = {a: [3,4], b: [3,4]}
            merge(c, d)
            expect(c).to.be.deep.equal({a: [1, 2, 3, 4], b: [1, 2, 3, 4]})

            const e = {a: {b: [1]}}
            const f = {a: {b: [2]}}
            merge(e, f)
            expect(e).to.be.deep.equal({a: {b: [1, 2]}})
        })
    })
})
