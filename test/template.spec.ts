import {featherStart} from './test-head'
import {expect} from 'chai'

describe('Templates', () => {

    let window, featherTs, document
    before(async () => featherStart().then((w: any) => (
        window = w,
        featherTs = w.feather,
        document = w.document
    )))

    describe('Self closing tags', () => {

        it('Regexp works', () => {
            const r = featherTs.annotations.selfClosingTags,
                o = featherTs.annotations.openTags
            expect('<span/><span/>'.replace(r, o)).to.be.equal('<span></span><span></span>')
            expect('<bla><span/><span/></bla>'.replace(r, o)).to.be.equal('<bla><span></span><span></span></bla>')
            expect('<span {{bla}}/><span {{bla}}/><span {{bla}}/>'.replace(r, o)).to.be.equal('<span {{bla}}></span><span {{bla}}></span><span {{bla}}></span>')
            expect(' <ul id="filtered-list" {{filteredList:arrayFilter}} truthy="{{filteredList:countTruthy}}"/> '.replace(r, o))
                .to.be.equal(' <ul id="filtered-list" {{filteredList:arrayFilter}} truthy="{{filteredList:countTruthy}}"></ul> ')
            expect('<bla> <span/> <br><p/> <span/> </bla>'.replace(r, o)).to.be.equal('<bla> <span></span> <br><p></p> <span></span> </bla>')
            expect(`<bla x="2"><span a='span>' checked b='<aa' y=1 z="2" w='</>' j="<>"/><span y=1 z="2" w="</>" j="<>"/></bla>`.replace(r, o))
                .to.be.equal(`<bla x="2"><span a='span>' checked b='<aa' y=1 z="2" w='</>' j="<>"></span><span y=1 z="2" w="</>" j="<>"></span></bla>`)
        })

        it('Template splits text nodes correctly', () => {
            const str = '<div>first: {{bla}} second: {{blub}}</div>',
                  pt = featherTs.annotations.getPreparsedTemplate,
                  parsed = pt(str)
            const childNodes = parsed.node.firstChild.childNodes
            expect(childNodes.length).to.be.equal(4)
            expect(childNodes[0].textContent).to.be.equal('first: ')
            expect(childNodes[1].textContent).to.be.equal('{{bla}}')
            expect(childNodes[2].textContent).to.be.equal(' second: ')
            expect(childNodes[3].textContent).to.be.equal('{{blub}}')
        })


        it('Template parses correctly with attributes', () => {
            const str = `
                    <AttributeWidget id="aw1" text="{'a'+'b'}" bool="{true}" func="{this.printStuff}" number="{3}"/>
                    <AttributeWidget id="aw2" text={this.printStuff()} bool={false} func={this.printStuff} number={4}/>
                `,
                pt = featherTs.annotations.getPreparsedTemplate,
                parsed = pt(str)
            expect(parsed.node.children.length).to.be.equal(2)
            expect(parsed.node.children[0].getAttribute('number')).to.be.equal('{3}')
            expect(parsed.node.children[1].getAttribute('number')).to.be.equal('{4}')
        })

        it('Template parses hooks', () => {
            const str = '<AttributeWidget {{hook1}} bla="{{hook2}}" class="bub {{hook3}}">in {{hook4}} text</AttributeWidget>',
                pt = featherTs.annotations.getPreparsedTemplate,
                parsed = pt(str)
            expect(parsed.hookInfos.length).to.be.equal(4)
            expect(parsed.hookInfos[0].curly).to.be.equal('hook1')
            expect(parsed.hookInfos[0].attribute).to.be.undefined
            expect(parsed.hookInfos[0].type).to.be.equal(featherTs.annotations.HookType.PROPERTY)

            expect(parsed.hookInfos[1].curly).to.be.equal('hook2')
            expect(parsed.hookInfos[1].attribute).to.be.equal('bla')
            expect(parsed.hookInfos[1].type).to.be.equal(featherTs.annotations.HookType.ATTRIBUTE)

            expect(parsed.hookInfos[2].curly).to.be.equal('hook3')
            expect(parsed.hookInfos[2].attribute).to.be.undefined
            expect(parsed.hookInfos[2].type).to.be.equal(featherTs.annotations.HookType.CLASS)

            expect(parsed.hookInfos[3].curly).to.be.equal('hook4')
            expect(parsed.hookInfos[3].attribute).to.be.undefined
            expect(parsed.hookInfos[3].type).to.be.equal(featherTs.annotations.HookType.TEXT)
        })

        it('Template clones', () => {
            const str = '<span {{bla}} /><span {{bla}} /><span {{bla}} />',
                pt = featherTs.annotations.getPreparsedTemplate,
                parsed = pt(str),
                cloned = parsed.asParsedTemplate()
            expect(cloned.hooks.length).to.be.equal(3)
            expect(cloned.doc.children.length).to.be.equal(3)

            const div1 = document.createElement('div'),
                  div2 = document.createElement('div')

            div1.appendChild(parsed.node)
            div2.appendChild(cloned.doc)

            expect(div1.innerHTML).to.be.equal(div2.innerHTML)
        })
    })
})
