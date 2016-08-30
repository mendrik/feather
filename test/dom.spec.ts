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
