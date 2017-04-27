import {expect, sinon, loadPage} from './test-head'

describe('Routes', () => {
    let sandbox, window, app, ef;

    before(done => {
        loadPage(r => {
            window = r.window
            app = r.app
            ef = r.ef
        });
        done();
    })

    beforeEach(() => this.sinon = sandbox = sinon.sandbox.create())
    afterEach(() => sandbox.restore())

    it('initially', () => {
        let proto = testApp.ExtraFeatures.prototype,
            spy2 = this.sinon.spy(proto, 'initRoutes'),
            spy = this.sinon.spy(proto, 'entry');
        window.feather.start()
        spy2.should.have.been.calledOnce
        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(window.ef)
        spy.should.have.been.calledWith({})
    })

    it('after navigation event', () => {
        let proto = testApp.ExtraFeatures.prototype,
            spy = this.sinon.spy(proto, 'subsection'),
            app = window.ef

        app.route('/mypath')
        expect(window.document.location.pathname).to.be.equal('/mypath')

        spy.should.have.been.calledOnce
        spy.should.have.been.calledOn(app)
        spy.should.have.been.calledWith({path: 'mypath'})
    })

})
