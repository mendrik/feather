/// <reference path="../out/javascripts/feather.d.ts" />
/// <reference path="../tmp/test-app.d.ts" />

import * as chai from 'chai';
import * as sinon from 'sinon';
import * as assert from 'power-assert';

import Application = testApp.Application;
import ExtraFeatures = testApp.ExtraFeatures;

chai.should();
chai.use(require('sinon-chai'));

let jsdom = require('./utils/dom.js'),
    exp = chai.expect;

interface EnrichedWindow extends Window, MouseEvent {
    demo: any,
    feather: any,
    app: Application,
    ef: ExtraFeatures
}

const loadPage = (done: Function) => {
    jsdom('./test/pages/application.html', () => {
        let window = jsdom.window,
            app = window['app'] as Application,
            ef = window['ef'] as ExtraFeatures
        done({window, app, ef})
    })
}

const featherStart = (callback: Function) => {
    loadPage(result => {
        result.window.feather.start()
        callback(result)
    })
}

export {chai, sinon, exp as expect, assert, loadPage, featherStart}
