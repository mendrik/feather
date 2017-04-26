import {document, expect, sinon, window} from './test-head';

let sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

describe('Events', () => {

    describe('click', () => {

        it('is received with selector', () => {
            let app = window['app2'],
                child = app.childWidgets[0],
                i = document.querySelector('i'),
                event = new (window as any).MouseEvent('click'),
                spy = this.sinon.spy(child, 'click')

            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null)
            i.dispatchEvent(event)
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(child)
            expect(spy.args[0][1]).to.be.equal(i)
        })

        it('is received on root', () => {
            let app = window.ef,
                child = app.childWidgets[0] as feather.core.Widget,
                root = child.element,
                i = document.querySelector('i'),
                event = new (window as any).MouseEvent('click'),
                spy = this.sinon.spy(child, 'clickRoot')
            event.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 1, null)
            root.dispatchEvent(event)
            i.dispatchEvent(event)
            spy.should.have.been.calledTwice
            spy.should.have.been.calledOn(child)

            expect(spy.args[0][1]).to.be.equal(root)
            expect(spy.args[1][1]).to.be.equal(i)
        })
    })
})
