module feather.annotations {

    import TypedMap              = feather.types.TypedMap
    import Widget                = feather.core.Widget
    import from                  = feather.arrays.from
    import allChildNodes         = feather.dom.allChildNodes
    import collect               = feather.objects.collectAnnotationsFromTypeMap
    import ensure                = feather.objects.ensure
    import SimpleMap             = feather.types.SimpleMap
    import ComponentInfo         = feather.boot.ComponentInfo
    import selectorMatches       = feather.dom.selectorMatches
    import allTextNodes          = feather.dom.allTextNodes

    const CURLIES                = /{{(.*?)}}/
    const ALL_CURLIES            = /{{(.*?)}}/g
    export const TEXT_CURLIES    = /(.*?){{(.*?)}}/gmi
    const templates              = new Map<any, TypedMap<Function>>()
    const parsedTemplateCache    = {} as Map<string, PreparsedTemplate>
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
                    public attribute: string,
                    public property: string,
                    public transformFns: string[]) {
        }

        hasMethods = () => this.transformFns.length > 0
    }

    export class HookInfo {

        constructor(public nodePosition: number,
                    public type: HookType,
                    public curly: string,
                    public attribute?: string,
                    public property?: string,
                    public transformFns?: string[]) {
        }
    }

    export interface ParsedTemplate {
        doc: Node,
        first: Element,
        hooks: Hook[],
        components: Component[]
    }

    export interface Component {
        info: ComponentInfo,
        nodes: HTMLElement[]
    }

    export interface PreComponent {
        info: ComponentInfo,
        nodes: number[]
    }

    export class PreparsedTemplate {

        constructor(public node: Node,
                    public hookInfos: feather.annotations.HookInfo[],
                    public hookMap: SimpleMap,
                    public preComponents: PreComponent[]) {
            for (let i = 0, n = hookInfos.length; i < n; i++) {
                const hookInfo = hookInfos[i],
                      originalCurly = this.hookMap[hookInfo.curly.toLowerCase()],
                      transformFns = originalCurly.split(/:/)
                hookInfo.property = transformFns.shift()
                hookInfo.transformFns = transformFns
            }
        }

        asParsedTemplate(): ParsedTemplate {
            const doc = this.node.cloneNode(true),
                  nodeList = allChildNodes(doc),
                  hooks = this.hookInfos.map(i => {
                      return new Hook(
                          nodeList[i.nodePosition],
                          i.type,
                          i.attribute,
                          i.property,
                          i.transformFns
                      )
                  })
            const preComponents = this.preComponents,
                  n = preComponents.length,
                  components: Component[] = []
            for (let i = 0; i < n; i++) {
                const pre = preComponents[i],
                      m = pre.nodes.length,
                      nodes = []
                for (let j = 0; j < m; j++) {
                    nodes[j] = nodeList[pre.nodes[j]];
                }
                components[i] = {info: pre.info, nodes: nodes}
            }
            return {
                doc,
                first: nodeList[1],
                hooks,
                components
            }
        }
    }

    // to be able to replace parts in text nodes, we need to split them into separate nodes
    const breakApartTextNodes = (root: DocumentFragment) => {
        allTextNodes(root).forEach(node => {
            const split = node.textContent.split(/({{.*?}})/mg)
            if (split.length > 1) {
                const parent = node.parentNode,
                      doc    = document.createDocumentFragment()
                split.forEach(text => {
                    if (text !== '') {
                        doc.appendChild(document.createTextNode(text))
                    }
                })
                parent.replaceChild(doc, node)
            }
        })
        return root;
    }

    const range = document.createRange()
    export const getFragment = (html: string) => range.createContextualFragment(html)

    export function getPreparsedTemplate(templateStr: string): PreparsedTemplate {
        const source   = templateStr.replace(selfClosingTags, openTags),
              frag     = breakApartTextNodes(getFragment(source)),
              allNodes = allChildNodes(frag),
              hookMap  = {} // we need to remember case sensitive hooks, b/c attributes turn lowercase
        let m
        while (m = ALL_CURLIES.exec(templateStr)) {
            hookMap[m[1].toLowerCase()] = m[1]
        }
        const registry = feather.boot.WidgetFactory.widgetRegistry,
              components = []
        // find components in this template
        for (let i = 0, r = registry.length, m = allNodes.length; i < r; i++) {
            const nodes = [],
                  info = registry[i]
            for (let n = 0; n < m; n++) {
                const node = allNodes[n]
                if (node.nodeType === Node.ELEMENT_NODE && selectorMatches(node, registry[i].selector)) {
                    nodes.push(n)
                }
            }
            if (nodes.length > 0) {
                components.push({info, nodes})
            }
        }
        return new PreparsedTemplate(frag, parseHooks(allNodes), hookMap, components)
    }

    function parseHooks(nodes: Node[]): HookInfo[] {
        const hooks: HookInfo[] = []
        let match
        nodes.forEach((node, pos) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent,
                      match = CURLIES.exec(text)
                // <div id="2">some text {{myProperty}}</div>
                if (match !== null) {
                    hooks.push(new HookInfo(pos, HookType.TEXT, match[1]))
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const attribute of from<Attr>(node.attributes)) {
                    const attributeName = attribute.nodeName
                    if (match = attributeName.match(CURLIES)) {
                        // <div id="2" {{myProperty}}>
                        (node as HTMLElement).removeAttribute(match[0])
                        hooks.push(new HookInfo(pos, HookType.PROPERTY, match[1]))
                    } else if (attributeName === 'class') {
                        // <div id="2" class="red {{myClass}} blue">
                        const classes = from<string>((node as HTMLElement).classList)
                        for (const cls of classes) {
                            if (match = cls.match(CURLIES)) {
                                (node as HTMLElement).classList.remove(match[0])
                                hooks.push(new HookInfo(pos, HookType.CLASS, match[1]))
                            }
                        }
                    } else {
                        // <div id="2" myProperty="{{myProperty}}">
                        const value = attribute.value
                        if (match = value.match(CURLIES)) {
                            (node as HTMLElement).setAttribute(attributeName, '')
                            hooks.push(new HookInfo(pos, HookType.ATTRIBUTE, match[1], attributeName))
                        }
                    }
                }
            }
        })
        return hooks
    }

    export class TemplateFactory {

        static getTemplate(widget: Widget, name: string): ParsedTemplate {
            const method = collect(templates, widget)[name],
                  templateString: string = method.call(widget)
            let preparsedTemplate = parsedTemplateCache[templateString]
            if (!preparsedTemplate) {
                preparsedTemplate = getPreparsedTemplate(templateString)
                parsedTemplateCache[templateString] = preparsedTemplate
            }
            return preparsedTemplate.asParsedTemplate()
        }

        static warmUp = () => {
            templates.forEach((map, proto) => Object.keys(map).forEach(template => {
                const method = map[template]
                try {
                    const str = method.call({})
                    parsedTemplateCache[str] = getPreparsedTemplate(str)
                } catch (e) {
                    console.warn(`Template method ${method} in ${proto.constructor.name} is not a pure function.`, e)
                }
            }))
        }
    }

    export let Template = (name: string = 'default') => (proto: Widget, method: string) => {
        ensure(templates, proto, {[name]: proto[method]})
    }

}
