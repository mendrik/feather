module feather.boot {

    import querySelectorWithRoot = feather.dom.querySelectorWithRoot
    import Constructable         = feather.core.Constructable
    import ValidRoot             = feather.types.ValidRoot
    import Widget                = feather.core.Widget

    export interface Blueprint {
        selector: string
        attributes?: string[]
    }

    export class ComponentInfo implements Blueprint {
        constructor(
            public selector: string,
            public attributes: string[],
            public component: Constructable
        ) {}
    }

    export class WidgetFactory {
        private static widgetRegistry: ComponentInfo[] = []

        static attributeParser = (node: HTMLElement, context?: any) => (key: string) => {
            let value: any = node.getAttribute(key),
                m = (value || "").match(/^\{(.+?)\}\/?$/i)
            if (m) {
                const js = m[1]
                value = context[js] || (function(str) {
                    return eval(str);
                }).bind(context)(js)
                if (typeof value !== 'undefined') {
                    node.removeAttribute(key)
                }
            }
            return value;
        }

        static start(scope: ValidRoot = document, parentWidget?: Widget) {
            let reg = WidgetFactory.widgetRegistry
            for (let i = 0, n = reg.length; i < n; i++) {
                let info = reg[i],
                    nodes = querySelectorWithRoot(scope, info.selector)
                for (let j = 0, m = nodes.length; j < m; j++) {
                    let node = nodes[j],
                        args = info.attributes.map(WidgetFactory.attributeParser(node, parentWidget || window)),
                        widget: Widget = new (Function.prototype.bind.apply(info.component, [null, ...args]))
                    if (node.hasAttribute('id')) {
                        widget.id = node.getAttribute('id')
                    }
                    if (parentWidget) {
                        widget.parentWidget = parentWidget
                        parentWidget.childWidgets.push(widget)
                    }
                    widget.bindToElement(node)
                }
            }
            if (scope === document) {
                feather.routing.runRoutes()
            }
        }

        static register(info: Blueprint, component: any) {
            this.widgetRegistry.push(new ComponentInfo(info.selector, info.attributes || [], component))
        }
    }
}

module feather {
    export let start = () => feather.boot.WidgetFactory.start()
}
