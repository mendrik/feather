module feather.core {

    import TemplateFactory = feather.annotations.TemplateFactory
    import Observable      = feather.observe.Observable
    import ParsedTemplate  = feather.annotations.ParsedTemplate
    import WidgetFactory   = feather.boot.WidgetFactory
    import removeFromArray = feather.arrays.removeFromArray

    export interface Initializable {
    }

    export interface Constructable {
        new(): Initializable
    }

    export type StringGenerator = () => string

    export abstract class Widget extends Observable implements Initializable {
        element: Element
        id?: string|StringGenerator

        bindToElement(element: Element) {
            this.element = element
            this.init(element)
            this.attachEvents()
            this.initRoutes()
            this.attachMediaListeners()
        }

        // noinspection JSUnusedGlobalSymbols
        protected render(templateName: string = 'default') {
            const parsed = this.getParsed(templateName)
            this.element.appendChild(parsed.doc)
        }

        getParsed(templateName: string): ParsedTemplate {
            const template = TemplateFactory.getTemplate(this, templateName),
                  components = template.components
            for (let i = 0, n = components.length; i < n; i++) {
                const component = components[i]
                WidgetFactory.initComponents(component.nodes, component.info, this)
            }
            this.attachHooks(template.hooks)
            return template
        }

        // noinspection JSUnusedLocalSymbols
        init(element: Element) {
            // override this with this.render('templatename') in sub classes of Widget
        }

        cleanUp() {
            setTimeout(() => {
                super.cleanUp()
                for (const cw of this.childWidgets) {
                    cw.cleanUp()
                }
                removeFromArray(WidgetFactory.singletonRegistry, [this])
            }, 10)
        }
    }
}

