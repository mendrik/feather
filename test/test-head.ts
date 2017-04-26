/// <reference path="../out/javascripts/feather.d.ts" />
/// <reference path="../tmp/test-app.d.ts" />

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as assert from 'assert';

import Application = testApp.Application;
import ExtraFeatures = testApp.ExtraFeatures;

let jsdom = require('./utils/dom.js');

chai.should();
chai.use(require('sinon-chai'));

interface EnrichedWindow extends Window {
    demo: any,
    feather: any,
    app: Application,
    ef: ExtraFeatures
}

let window: EnrichedWindow,
    document: Document;

before((done) => {
    jsdom('./test/pages/application.html', () => {
        window = jsdom.window
        document = jsdom.document
        window.app = window['app'] as Application;
        window.ef = window['app2'] as ExtraFeatures;
        done()
    })
})

let exp = chai.expect;

export {chai, sinon, window, document, exp as expect, assert}
