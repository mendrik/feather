import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Templates', () => {

    let window, featherTs, document;
    before(done => featherStart(w => (
        window = w,
        featherTs = w.feather,
        document = w.document
    ) && done()))

    describe('Self closing tags', () => {

        it('Regexp works', () => {
            let r = featherTs.annotations.selfClosingTags,
                o = featherTs.annotations.openTags
            expect('<span/><span/>'.replace(r, o)).to.be.equal('<span></span><span></span>')
            expect('<bla><span/><span/></bla>'.replace(r, o)).to.be.equal('<bla><span></span><span></span></bla>')
            expect('<bla> <span/> <br><p/> <span/> </bla>'.replace(r, o)).to.be.equal('<bla> <span></span> <br><p></p> <span></span> </bla>')
            expect(`<bla x="2"><span a='span>' checked b='<aa' y=1 z="2" w='</>' j="<>"/><span y=1 z="2" w="</>" j="<>"/></bla>`.replace(r, o))
                .to.be.equal(`<bla x="2"><span a='span>' checked b='<aa' y=1 z="2" w='</>' j="<>"></span><span y=1 z="2" w="</>" j="<>"></span></bla>`)
        })

        it('Tenplate parses correctly', () => {
            let str = `
                    <AttributeWidget id="aw1" text="{'a'+'b'}" bool="{true}" func="{this.printStuff}" number="{3}"/>
                    <AttributeWidget id="aw2" text={this.printStuff()} bool={false} func={this.printStuff} number={4}/>
                `,
                pt = featherTs.annotations.getPreparsedTemplate,
                parsed = pt(str);
            expect(parsed.node.children.length).to.be.equal(2);
            expect(parsed.node.children[0].getAttribute('number')).to.be.equal('{3}');
            expect(parsed.node.children[1].getAttribute('number')).to.be.equal('{4}');
        })

        it('Tenplate parses hooks', () => {
            let str = `
                    <AttributeWidget {{hook1}} bla="{{hook2}}" class="bub {{hook3}}">in {{hook4}} text</AttributeWidget>
                `,
                pt = featherTs.annotations.getPreparsedTemplate,
                parsed = pt(str)
            expect(parsed.hookInfos.length).to.be.equal(4);
            expect(parsed.hookInfos[0].curly).to.be.equal('hook1')
            expect(parsed.hookInfos[0].text).to.be.undefined
            expect(parsed.hookInfos[0].type).to.be.equal(feather.annotations.HookType.PROPERTY)

            expect(parsed.hookInfos[1].curly).to.be.equal('hook2')
            expect(parsed.hookInfos[1].text).to.be.equal('bla')
            expect(parsed.hookInfos[1].type).to.be.equal(feather.annotations.HookType.ATTRIBUTE)

            expect(parsed.hookInfos[2].curly).to.be.equal('hook3')
            expect(parsed.hookInfos[2].text).to.be.undefined
            expect(parsed.hookInfos[2].type).to.be.equal(feather.annotations.HookType.CLASS)

            expect(parsed.hookInfos[3].curly).to.be.equal('hook4')
            expect(parsed.hookInfos[3].text).to.be.equal('in {{hook4}} text')
            expect(parsed.hookInfos[3].type).to.be.equal(feather.annotations.HookType.TEXT)
        })
    })
    
})
