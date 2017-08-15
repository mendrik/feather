import {featherStart} from './test-head'
import {expect} from 'chai'
import * as sinon from 'sinon'

describe('Objects', () => {

    let window, feather, sandbox;
    before(done => featherStart(w => (
        window = w,
            feather = w.feather
    ) && done()))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('isObject', () => {

        it('{} should be an object', () => {
            const isObject = feather.objects.isObject;

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
                },
                test2 = ['a', 'b', 'c']
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
                        b: 5
                    }
                }
            expect(deepValue(test, 'a')).to.be.equal(1)
            expect(deepValue(test, 'e')).to.be.undefined
            expect(deepValue(test, 'd')).to.be.deep.equal({a: 4,  b: 5})
            expect(deepValue(test, 'd.a')).to.be.equal(4)
            expect(deepValue(test, 'd.c')).to.be.undefined

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
            plc: number;
            name: string;
        }

        interface Address {
            street: string;
            home: boolean;
            city: City;
        }

        interface User {
            name: string;
            mainAddress: Address;
            additional: Address[];
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
        };

        class Test {
            constructor(public user?: User) {}
            callback () {
                // ignore
            }
        }

        it('Should trigger callback', () => {
            const test = new Test();
            const observe = feather.objects.createObjectPropertyListener;
            expect(test.user).to.be.undefined
            const spy = this.sinon.spy(test, 'callback')
            observe(test, 'user', test.callback)

            test.user = user;
            expect(test.user).to.not.be.undefined
            spy.should.have.been.calledOnce
            spy.reset()

            const newName = 'Peter Peterson'
            test.user.name = newName
            spy.should.have.been.calledOnce
            expect(test.user.name).to.be.equal(newName)
            spy.reset()

            test.user.mainAddress.city.plc = 600
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.additional.push(address1)
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.additional = []
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.additional.push(address2)
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.mainAddress.city = city2
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.mainAddress.city.plc = 700
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.additional[0].city = city1
            spy.should.have.been.calledOnce
            spy.reset()

            test.user.additional[0].city.plc = 900
            spy.should.have.been.calledOnce
            spy.reset()
        })
    })
})
