module feather.boot {

    import querySelectorWithRoot = feather.dom.querySelectorWithRoot
    import Constructable         = feather.core.Constructable
    import ValidRoot             = feather.types.ValidRoot
    import Widget                = feather.core.Widget
    import deepValue             = feather.objects.deepValue
    import values                = feather.objects.values
    import from                  = feather.arrays.from
    import flatMap               = feather.arrays.flatMap
    import selectorMatches       = feather.dom.selectorMatches

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

        static start(context?: ValidRoot, parentWidget?: Widget): Widget[] {
            let selector = WidgetFactory.widgetRegistry.map(info => info.selector).join(','),
                scope: ValidRoot = context ? context : document
            if (!selector) {
                return []
            }
            let widgetNodes = querySelectorWithRoot(scope, selector)
            for (let node of widgetNodes) {
                let componentInfos = WidgetFactory.widgetRegistry.filter(info => selectorMatches(node, info.selector))

                for (let info of componentInfos) {
                    let args = info.attributes.map(key => node.getAttribute(key)),
                        widget: Widget = new (Function.prototype.bind.apply(info.component, [null].concat(args)))
                    if (parentWidget) {
                        widget.parentWidget = parentWidget
                        parentWidget.childWidgets.push(widget)
                    }
                    widget.bindToElement(node)
                }
            }
            if (!context) {
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
