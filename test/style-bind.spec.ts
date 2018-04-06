import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Style binding', () => {

    let window, feather, document
    before(async () => featherStart().then((w: any) => (
        window = w,
        feather = w.feather,
        document = w.document
    )))

    it('Binds object correctly', () => {
        const inh = window.inh as demo.Inheritance,
              inheritDiv = document.querySelector('#inherit')
        expect(inheritDiv.style.borderWidth).to.be.equal('1px')
        expect(inheritDiv.style.color).to.be.equal('red')
        inh.styles.borderWidth = '2px'
        inh.styles.color = 'blue'
        expect(inheritDiv.style.borderWidth).to.be.equal('2px')
        expect(inheritDiv.style.color).to.be.equal('blue')
    })
})
