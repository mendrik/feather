module feather.annotations {

    import TypedMap              = feather.types.TypedMap
    import Widget                = feather.core.Widget
    import from                  = feather.arrays.from
    import allChildNodes         = feather.dom.allChildNodes
    import collect               = feather.objects.collectAnnotationsFromTypeMap
    import ensure                = feather.objects.ensure
    import SimpleMap             = feather.types.SimpleMap

    const CURLIES                = /{{(.*?)}}/
    const ALL_CURLIES            = /{{(.*?)}}/g
    const templates              = new WeakMap<Widget, TypedMap<Function>>()
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
                    public curly: string,
                    public attribute: string,
                    public text: string,
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
                    public text?: string) {
        }
    }

    export interface ParsedTemplate {
        doc: Node,
        first: Element,
        hooks: Hook[]
    }

    export class PreparsedTemplate {

        constructor(public node: Node,
                    public hookInfos: feather.annotations.HookInfo[],
                    public hookMap: SimpleMap) {
        }

        asParsedTemplate(): ParsedTemplate {
            const doc = this.node.cloneNode(true),
                  nodeList = allChildNodes(doc),
                  hooks = this.hookInfos.map(i => {
                      const originalCurly = this.hookMap[i.curly.toLowerCase()],
                            transformFns  = originalCurly.split(/:/),
                            property      = transformFns.shift()
                      return new Hook(
                          nodeList[i.nodePosition],
                          i.type,
                          i.curly,
                          i.attribute,
                          i.text,
                          property,
                          transformFns
                      )
                  })
            return {
                doc,
                first: nodeList[1],
                hooks
            }
        }
    }

    const range = document.createRange()

    export function getPreparsedTemplate(templateStr: string): PreparsedTemplate {
        const source = templateStr.replace(selfClosingTags, openTags),
            frag = range.createContextualFragment(source),
            allNodes = allChildNodes(frag),
            hookMap = {} // we need to remember case sensitive hooks, b/c attributes turn lowercase
        let m
        while (m = ALL_CURLIES.exec(templateStr)) {
            hookMap[m[1].toLowerCase()] = m[1]
        }
        return new PreparsedTemplate(frag, parseHooks(allNodes), hookMap)
    }

    function parseHooks(nodes: Node[]): HookInfo[] {
        const hooks: HookInfo[] = []
        let match
        nodes.forEach((node, pos) => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent
                // <div id="2">some text {{myProperty}}</div>
                while ((match = ALL_CURLIES.exec(text)) !== null) {
                    hooks.push(new HookInfo(pos, HookType.TEXT, match[1], undefined, text))
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const attribute of from<Attr>(node.attributes)) {
                    const attributeName = attribute.nodeName
                    if (match = attributeName.match(CURLIES)) {
                        // <div id="2" {{myProperty}}>
                        hooks.push(new HookInfo(pos, HookType.PROPERTY, match[1]))
                    } else if (attributeName === 'class') {
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
    }

    export let Template = (name: string = 'default', warmUp = true) => (proto: Widget, method: string) => {
        ensure(templates, proto, {[name]: proto[method]})
        if (warmUp) { // preparse template for better performance
            try {
                const str = proto[method].call({})
                parsedTemplateCache[str] = getPreparsedTemplate(str)
            } catch (e) {
                console.warn(`Template method ${method} in ${proto.constructor['name']} is not a pure function.`, e)
            }
        }
    }
}
