import {featherStart} from './test-head'
import * as sinon from 'sinon'

describe('Events', () => {

    let window, feather, sandbox, document
    before(async () => featherStart().then(w => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    describe('click', () => {

        it('is received correctly', () => {
            const parent = window['event-test'] as demo.EventListener,
                  child = parent.childWidgets[0] as demo.EventListener,
                  childIcon = child.element.querySelector('div > span > i'),
                  parentButton = parent.element.querySelector('div > button'),
                  childSpan = child.element.querySelector('div > span'),
                  parentButtonClick = this.sinon.spy(parent, 'buttonClick'),
                  parentRootClick = this.sinon.spy(parent, 'rootClick'),
                  parentIconClick = this.sinon.spy(parent, 'iconClick'),
                  parentSpanClick = this.sinon.spy(parent, 'spanClick'),
                  childButtonClick = this.sinon.spy(child, 'buttonClick'),
                  childRootClick = this.sinon.spy(child, 'rootClick'),
                  childIconClick = this.sinon.spy(child, 'iconClick'),
                  childSpanClick = this.sinon.spy(child, 'spanClick')

            const event = document.createEvent('HTMLEvents')
            event.initEvent('click', true, true)
            childIcon.dispatchEvent(event)
            childIconClick.should.have.been.calledOnce
            parentIconClick.should.have.not.been.called
            parentRootClick.should.have.not.been.called
            childSpan.dispatchEvent(event)
            childSpanClick.should.have.been.calledOnce
            childRootClick.should.have.been.calledOnce
            parentRootClick.should.have.not.been.calledOnce
            parentButton.dispatchEvent(event)
            parentButtonClick.should.have.been.calledOnce
            parentRootClick.should.have.been.calledOnce
            // reset
            ;[parentButtonClick, parentRootClick, parentIconClick, parentSpanClick,
             childButtonClick, childRootClick, childIconClick, childSpanClick]
                .forEach(s => s.restore())
        })
    })
})
