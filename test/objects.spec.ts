/// <reference path="../typings/index.d.ts" />
/// <reference path="../out/javascripts/feather.d.ts" />
/// <reference path="../tmp/test-app.d.ts" />

import chai = require('chai')
import assert = require('assert')

let expect = chai.expect,
    jsdom = require('./utils/dom.js');

let window: Window, document: Document;

before((done) => {
    jsdom('./test/pages/application.html', () => {
        window = jsdom.window
        document = jsdom.document
        done()
    })
})

describe('Objects', () => {
    describe('isObject', () => {

        it('{} should be an object', () => {
            let isObject = feather.objects.isObject;

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
            let values = feather.objects.values,
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
            let deepValue = feather.objects.deepValue,
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
        })
    })
})
