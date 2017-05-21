module feather.annotations {

    import TypedMap      = feather.types.TypedMap
    import Widget        = feather.core.Widget
    import from          = feather.arrays.from
    import allChildNodes = feather.dom.allChildNodes

    const supportsTemplate    = 'content' in document.createElement('template') && 'firstElementChild' in document.createDocumentFragment()
    const CURLIES             = /\{\{(.*?)}}/
    const ALL_CURLIES         = /\{\{(.*?)}}/g
    const templates           = new WeakMap<Widget, TypedMap<Function>>()
    const parsedTemplateCache = {} as Map<string, PreparsedTemplate>
    export const selfClosingTags     = /<(\w+)((\s+([^=\s\/<>]+|\w+=('[^']*'|"[^"]*"|[^"']\S*)))*)\s*\/>/gi
    export const openTags            = '<$1$2></$1>'

    let template              = supportsTemplate ? document.createElement('template') : document.createElement('div')

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

    export class HookInfo {

        constructor(public nodePosition: number,
                    public type: HookType,
                    public curly: string,
                    public text?: string) {}
    }

    export interface ParsedTemplate {
        doc: DocumentFragment,
        first: HTMLElement,
        hooks: Hook[]
    }

    export class PreparsedTemplate {

        constructor(public node: DocumentFragment,
                    public hookInfos: feather.annotations.HookInfo[]) {}

        asParsedTemplate(): ParsedTemplate {
            let doc = this.node.cloneNode(true),
                nodeList = allChildNodes(doc),
                hooks = this.hookInfos.map(i => new Hook(nodeList[i.nodePosition], i.type, i.curly, i.text))
            return {
                doc: doc,
                first: nodeList[1],
                hooks: hooks
            } as ParsedTemplate
        }
    }

    export function getPreparsedTemplate(templateStr: string): PreparsedTemplate {
        let frag
        template.innerHTML = templateStr.replace(selfClosingTags, openTags)
        if (supportsTemplate) {
            frag = document.importNode((template as HTMLTemplateElement).content, true)
        } else {
            frag = document.createDocumentFragment()
            while (template.firstChild) {
                frag.appendChild(template.firstChild)
            }
        }
        let allNodes = allChildNodes(frag);
        return new PreparsedTemplate(frag, parseHooks(allNodes))
    }

    function parseHooks(nodes: Node[]): HookInfo[] {
        let hooks: HookInfo[] = [],
            match
        nodes.forEach((node, pos) => {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.textContent
                // <div id="2">some text {{myProperty}}</div>
                while ((match = ALL_CURLIES.exec(text)) !== null) {
                    hooks.push(new HookInfo(pos, HookType.TEXT, match[1], text))
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                let attribs = from<Node>(node.attributes),
                    attribName
                for (let attrib of attribs) {
                    attribName = attrib.nodeName
                    if (match = attribName.match(CURLIES)) {
                        // <div id="2" {{myProperty}}>
                        hooks.push(new HookInfo(pos, HookType.PROPERTY, match[1]))
                    } else if (attribName === 'class') {
                        // <div id="2" class="red {{myClass}} blue">
                        let classes = from<string>((node as HTMLElement).classList)
                        for (let cls of classes) {
                            if (match = cls.match(CURLIES)) {
                                hooks.push(new HookInfo(pos, HookType.CLASS, match[1]))
                            }
                        }
                    } else {
                        // <div id="2" myProperty="{{myProperty}}">
                        let attribValue = attrib.nodeValue
                        if (match = attribValue.match(CURLIES)) {
                            hooks.push(new HookInfo(pos, HookType.ATTRIBUTE, match[1], attribName))
                        }
                    }
                }
            }
        })
        return hooks
    }

    export class TemplateFactory {

        static getTemplate(widget: Widget, name: string): ParsedTemplate {
            let method = templates.get(Object.getPrototypeOf(widget))[name],
                templateString: string = method.call(widget),
                preparsedTemplate = parsedTemplateCache[templateString]
            if (!preparsedTemplate) {
                preparsedTemplate = getPreparsedTemplate(templateString)
                parsedTemplateCache[templateString] = preparsedTemplate
            }
            return preparsedTemplate.asParsedTemplate();
        }

    }

    export let Template = (name: string = 'default') => (proto: Widget, method: string) => {
        let widgetTemplates = templates.get(proto)
        if (!widgetTemplates) {
            templates.set(proto, widgetTemplates = {})
        }
        widgetTemplates[name] = proto[method]

        try {
            let str = proto[method].call({})
            parsedTemplateCache[str] = getPreparsedTemplate(str)
        } catch (e) {
            console.warn(`Template method ${method} in ${proto.constructor} is not a pure function.`)
        }
    }
}
