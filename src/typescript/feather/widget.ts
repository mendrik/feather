module feather.core {

    import TemplateFactory = feather.annotations.TemplateFactory
    import SimpleMap       = feather.types.SimpleMap
    import ValidRoot       = feather.types.ValidRoot
    import Observable      = feather.observe.Observable
    import ParsedTemplate  = feather.annotations.ParsedTemplate
    import Primitive       = feather.types.Primitive
    import insertBefore    = feather.dom.insertBefore
    import TypedMap        = feather.types.TypedMap;
    import WidgetFactory   = feather.boot.WidgetFactory;
    import from            = feather.arrays.from;

    export interface Initializable {
    }

    export interface Constructable {
        new(): Initializable
    }

    export abstract class Widget extends Observable implements Initializable {
        element: HTMLElement

        bindToElement(element: HTMLElement) {
            this.element = element
            this.init(element)
            this.attachEvents(element)
            this.initRoutes()
        }

        protected render(templateName: string) {
            let parsed = this.getParsed(templateName),
                el = this.element
            if (el.nodeType === 1) {
                el.innerHTML = ''
            }
            el.appendChild(parsed.doc)
        }

        private getParsed(templateName: string): ParsedTemplate {
            let template = TemplateFactory.getTemplate(this, templateName)
            from<HTMLElement>(template.doc.children).forEach(x => WidgetFactory.start(x, this))
            this.attachHooks(template.hooks)
            return template
        }

        init(element: HTMLElement) {
            // override this with this.render('templatename') in sub classes of Widget
        }

        appendTemplateRoot(parent: ValidRoot, templateName: string) {
            if (!templateName) {
                throw Error('Bound lists must specify template name in @Bind()')
            }
            if (!this.element) {
                let parsed = this.getParsed(templateName)
                this.bindToElement(parsed.first)
                parent.appendChild(parsed.first)
            } else { // already created, let's swap parents
                parent.appendChild(this.element)
            }
        }
    }
}

