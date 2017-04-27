import {expect, featherStart, sinon} from './test-head'

describe('Events', () => {
    let sandbox, window, app, ef, document;

    before(done => {
        featherStart(r => {
            window = r.window
            document = r.window.document
            app = r.app
            ef = r.ef
        });
        done()
    })

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('click', () => {

        it('is received with selector', () => {
            let app = window.ef,
                child = app.childWidgets[0] as feather.core.Widget,
                i = child.element.querySelector('i'),
                event = document.createEvent("HTMLEvents"),
                spy = this.sinon.spy(child, 'click')
            event.initEvent('click', true, true)
            i.dispatchEvent(event)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(child)
            expect(spy.args[0][1]).to.be.equal(i)
        })

        it('is received on root', () => {
            let app = window.ef,
                child = app.childWidgets[0] as feather.core.Widget,
                root = child.element,
                i = root.querySelector('i'),
                event = document.createEvent("HTMLEvents"),
                spy = this.sinon.spy(child, 'clickRoot')
            event.initEvent('click', true, true)
            root.dispatchEvent(event)
            i.dispatchEvent(event)
            spy.should.have.been.calledTwice
            spy.should.have.been.calledOn(child)

            expect(spy.args[0][1]).to.be.equal(root)
            expect(spy.args[1][1]).to.be.equal(i)
        })
    })
})
