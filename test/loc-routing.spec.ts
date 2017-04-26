import {sinon, document, window, expect} from './test-head';

let sandbox
beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
afterEach(() => sandbox.restore())

describe('Routes', () => {
    describe('load', () => {

        it('initially', () => {
            let proto = testApp.ExtraFeatures.prototype,
                spy2 = this.sinon.spy(proto, 'initRoutes'),
                spy = this.sinon.spy(proto, 'entry');
            window.feather.boot.WidgetFactory.start()
            spy2.should.have.been.calledOnce
            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(window.app)
            spy.should.have.been.calledWith({})
        })

        it('after navigation event', () => {
            let proto = testApp.ExtraFeatures.prototype,
                spy = this.sinon.spy(proto, 'subsection');
            let app = window.ef
            app.route('/mypath')
            expect(document.location.pathname).to.be.equal('/mypath')

            spy.should.have.been.calledOnce
            spy.should.have.been.calledOn(app)
            spy.should.have.been.calledWith({path: 'mypath'})
        })
    })
})
