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

        private getParsed(templateName: string): ParsedTemplate {
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

        appendTemplateRoot(parent: ValidRoot, templateName: string) {
            if (!templateName) {
                throw Error('Bound lists must specify template name in @Bind()')
            }
            if (!this.element) {
                const parsed = this.getParsed(templateName)
                this.bindToElement(parsed.first)
                parent.appendChild(parsed.first)
            } else { // already created, let's swap parents
                parent.appendChild(this.element)
            }
        }

        cleanUp() {
            super.cleanUp()
            removeFromArray(WidgetFactory.singletonRegistry, [this])
        }
    }
}

