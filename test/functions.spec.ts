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
