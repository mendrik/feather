module feather.core {

    import TemplateFactory = feather.annotations.TemplateFactory
    import ValidRoot       = feather.types.ValidRoot
    import Observable      = feather.observe.Observable
    import ParsedTemplate  = feather.annotations.ParsedTemplate
    import WidgetFactory   = feather.boot.WidgetFactory
    import from            = feather.arrays.from
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
            const template = TemplateFactory.getTemplate(this, templateName)
            from<HTMLElement>(template.doc.childNodes)
                .filter(n => n.nodeType === Node.ELEMENT_NODE)
                .forEach(x => WidgetFactory.start(x, this))
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
                TemplateFactory.clearTemplates(this)
                removeFromArray(WidgetFactory.singletonRegistry, [this])
            }, 10)
        }
    }
}

