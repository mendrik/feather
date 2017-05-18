import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Templates', () => {

    let window, feather, document;
    before(done => featherStart(w => (
        window = w,
        feather = w.feather,
        document = w.document
    ) && done()))

    describe('Self closing tags', () => {

        it('Regexp works', () => {
            let r = feather.annotations.selfClosingTags,
                o = feather.annotations.openTags
            expect('<span/><span/>'.replace(r, o)).to.be.equal('<span></span><span></span>')
            expect('<bla><span/><span/></bla>'.replace(r, o)).to.be.equal('<bla><span></span><span></span></bla>')
            expect('<bla> <span/> <br><p/> <span/> </bla>'.replace(r, o)).to.be.equal('<bla> <span></span> <br><p></p> <span></span> </bla>')
            expect(`<bla x="2"><span a='span>' b='<aa' y=1 z="2" w='</>' j="<>"/><span y=1 z="2" w="</>" j="<>"/></bla>`.replace(r, o))
                .to.be.equal(`<bla x="2"><span a='span>' b='<aa' y=1 z="2" w='</>' j="<>"></span><span y=1 z="2" w="</>" j="<>"></span></bla>`)
        })

        it('Tenplate parses correctly', () => {
            let str = `
                    <AttributeWidget id="aw1" text="{'a'+'b'}" bool="{true}" func="{this.printStuff}" number="{3}"/>
                    <AttributeWidget id="aw2" text={this.printStuff()} bool={false} func={this.printStuff} number={4}/>
                `,
                pt = feather.annotations.getPreparsedTemplate,
                parsed = pt(str);
            expect(parsed.node.children.length).to.be.equal(2);
            expect(parsed.node.children[0].getAttribute('number')).to.be.equal('{3}');
            expect(parsed.node.children[1].getAttribute('number')).to.be.equal('{4}');
        })
    })
    
})
