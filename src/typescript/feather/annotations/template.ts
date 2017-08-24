module feather.annotations {

    import TypedMap      = feather.types.TypedMap
    import Widget        = feather.core.Widget
    import from          = feather.arrays.from
    import allChildNodes = feather.dom.allChildNodes
    import collect       = feather.objects.collectAnnotationsFromTypeMap
    import ensure        = feather.functions.ensure;

    const supportsTemplate       = 'content' in document.createElement('template') && 'firstElementChild' in document.createDocumentFragment()
    const CURLIES                = /{{(.*?)}}/
    const ALL_CURLIES            = /{{(.*?)}}/g
    const templates              = new WeakMap<Widget, TypedMap<Function>>()
    const parsedTemplateCache    = {} as Map<string, PreparsedTemplate>
    const template               = supportsTemplate ? document.createElement('template') : document.createElement('div')
    export const selfClosingTags = /<(\w+)((\s+([^=\s\/<>]+|\w+=('[^']*'|"[^"]*"|[^"']\S*)))*)\s*\/>/gi
    export const openTags        = '<$1$2></$1>'

    export const enum HookType {
        CLASS,
        PROPERTY,
        ATTRIBUTE,
        TEXT
    }

    export class Hook {

        constructor(public node: Element,
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
            const doc = this.node.cloneNode(true),
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
        const allNodes = allChildNodes(frag)
        return new PreparsedTemplate(frag, parseHooks(allNodes))
    }

    function parseHooks(nodes: Node[]): HookInfo[] {
        const hooks: HookInfo[] = []
        let match
        nodes.forEach((node, pos) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent
                // <div id="2">some text {{myProperty}}</div>
                while ((match = ALL_CURLIES.exec(text)) !== null) {
                    hooks.push(new HookInfo(pos, HookType.TEXT, match[1], text))
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const attribute of from<Attr>(node.attributes)) {
                    const name = attribute.nodeName
                    if (match = name.match(CURLIES)) {
                        // <div id="2" {{myProperty}}>
                        hooks.push(new HookInfo(pos, HookType.PROPERTY, match[1]))
                    } else if (name === 'class') {
                        // <div id="2" class="red {{myClass}} blue">
                        const classes = from<string>((node as HTMLElement).classList)
                        for (const cls of classes) {
                            if (match = cls.match(CURLIES)) {
                                hooks.push(new HookInfo(pos, HookType.CLASS, match[1]))
                            }
                        }
                    } else {
                        // <div id="2" myProperty="{{myProperty}}">
                        const value = attribute.value
                        if (match = value.match(CURLIES)) {
                            hooks.push(new HookInfo(pos, HookType.ATTRIBUTE, match[1], name))
                        }
                    }
                }
            }
        })
        return hooks
    }

    export class TemplateFactory {

        static getTemplate(widget: Widget, name: string): ParsedTemplate {
            const method = (collect(templates, widget) as TypedMap<Function>)[name],
                  templateString: string = method.call(widget)
            let preparsedTemplate = parsedTemplateCache[templateString]
            if (!preparsedTemplate) {
                preparsedTemplate = getPreparsedTemplate(templateString)
                parsedTemplateCache[templateString] = preparsedTemplate
            }
            return preparsedTemplate.asParsedTemplate()
        }

    }

    export let Template = (name: string = 'default', warmUp = true) => (proto: Widget, method: string) => {
        const widgetTemplates = ensure(templates, proto, {})
        widgetTemplates[name] = proto[method]
        if (warmUp) {
            try {
                const str = proto[method].call({})
                parsedTemplateCache[str] = getPreparsedTemplate(str)
            } catch (e) {
                console.warn(`Template method ${method} in ${proto.constructor} is not a pure function.`)
            }
        }
    }
}
