module feather.annotations {

    import TypedMap      = feather.types.TypedMap
    import Widget        = feather.core.Widget
    import from          = feather.arrays.from
    import allChildNodes = feather.dom.allChildNodes;

    const supportsTemplate  = 'content' in document.createElement('template') && 'firstElementChild' in document.createDocumentFragment()
    const CURLIES           = /\{\{(.*?)}}/
    const ALL_CURLIES       = /\{\{(.*?)}}/g
    const templates         = new WeakMap<Widget, TypedMap<TemplateFactory>>()

    let template            = supportsTemplate ? document.createElement('template') : document.createElement('div')

    export const enum HookType {
        CLASS,
        PROPERTY,
        ATTRIBUTE,
        TEXT
    }

    export class Hook {

        constructor(public node: Node,
                    public type: HookType,
                    public curly: string,
                    public text?: string) {}
    }

    export interface ParsedTemplate {
        doc: DocumentFragment,
        first: HTMLElement,
        hooks: Hook[]
    }

    export class TemplateFactory {

        constructor(private method: () => string) {}

        asParsedFragment(obj: Object): ParsedTemplate {
            let str = this.method.call(obj),
                frag,
                first
            if (supportsTemplate) {
                template.innerHTML = str
                frag = document.importNode((template as HTMLTemplateElement).content, true)
                first = frag.firstElementChild
            } else {
                frag = document.createDocumentFragment()
                template.innerHTML = str
                first = template.children[0]
                while (template.firstChild) {
                    frag.appendChild(template.firstChild)
                }
            }
            return {
                doc: frag,
                first: first,
                hooks: feather.annotations.TemplateFactory.parseHooks(frag)
            } as ParsedTemplate
        }

        private static parseHooks(doc: DocumentFragment) {
            let hooks: Hook[] = [],
                match,
                nodes = allChildNodes(doc)
            for (let node of nodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    // <div id="2">some text {{myProperty}}</div>
                    let text = node.textContent
                    while ((match = ALL_CURLIES.exec(text)) !== null) {
                        hooks.push(new Hook(node, HookType.TEXT, match[1], text))
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    let attribs = from<Node>(node.attributes),
                        attribName
                    for (let attrib of attribs) {
                        attribName = attrib.nodeName
                        if (match = attribName.match(CURLIES)) {
                            // <div id="2" {{myProperty}}>
                            hooks.push(new Hook(node, HookType.PROPERTY, match[1]))
                        } else if (attribName === 'class') {
                            // <div id="2" class="red {{myClass}} blue">
                            let classes = from<string>((node as HTMLElement).classList)
                            for (let cls of classes) {
                                if (match = cls.match(CURLIES)) {
                                    hooks.push(new Hook(node, HookType.CLASS, match[1]))
                                }
                            }
                        } else {
                            // <div id="2" myProperty="{{myProperty}}">
                            let attribValue = attrib.nodeValue
                            if (match = attribValue.match(CURLIES)) {
                                hooks.push(new Hook(node, HookType.ATTRIBUTE, match[1], attribName))
                            }
                        }
                    }
                }
            }
            return hooks
        }

        static getTemplate(widget: Widget, name: string): TemplateFactory {
            return templates.get(Object.getPrototypeOf(widget))[name]
        }
    }

    export let Template = (name: string) => (proto: Widget, method: string) => {
        let widgetTemplates = templates.get(proto)
        if (!widgetTemplates) {
            templates.set(proto, widgetTemplates = {})
        }
        widgetTemplates[name] = new TemplateFactory(proto[method])
    }
}
