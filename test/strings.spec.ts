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

describe('Strings', () => {

    describe('format', () => {

        it('should replace simple tokens', () => {
            let s = feather.strings,
                str = 'hello {{test}}';
            expect(s.format(str, {test: 'world'})).to.be.equal('hello world')
        })

        it('should replace deep values', () => {
            let s = feather.strings,
                str = 'hello {{test.me}}';
            expect(s.format(str, {test: {me: 'world'}})).to.be.equal('hello world')
        })

        it('should use filters on simple tokens', () => {
            let s = feather.strings,
                str = 'hello {{test:filter}}';
            expect(s.format(str, {test: 'world'}, {filter: (str) => str.toUpperCase()})).to.be.equal('hello WORLD')
        })

        it('should use filters on deepn value tokens', () => {
            let s = feather.strings,
                str = '{{hello}} {{test.me:filter}}';
            expect(s.format(str,
                {hello: 'hello', test: {me: 'world'}},
                {filter: (str) => str.toUpperCase()})).to.be.equal('hello WORLD')
        })

        it('should use multple filters', () => {
            let s = feather.strings,
                str = 'hello {{test:filter:yay}}';
            expect(s.format(str, {test: 'world'}, {
                filter: (str) => str.toUpperCase(),
                yay: (str) => str + '!'
            })).to.be.equal('hello WORLD!')
        })

    })
})
