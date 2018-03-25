module feather.core {

    import TemplateFactory = feather.annotations.TemplateFactory
    import Observable      = feather.observe.Observable
    import ParsedTemplate  = feather.annotations.ParsedTemplate
    import WidgetFactory   = feather.boot.WidgetFactory
    import removeFromArray = feather.arrays.removeFromArray
    import TypedMap        = feather.types.TypedMap

    export interface Initializable {
    }

    export interface Constructable {
        new(): Initializable
    }

    export type StringGenerator = () => string

    export enum RenderPlacement {
        append,
        prepend,
        replace
    }

    export abstract class Widget extends Observable implements Initializable {
        id?: string|StringGenerator

        bindToElement(element: Element, forTemplate: string = 'default') {
            this.setElement(forTemplate, element)
            this.init(element)
            this.attachEvents(forTemplate)
            this.initRoutes()
            this.attachMediaListeners()
        }

        // noinspection JSUnusedGlobalSymbols
        protected render(templateName: string = 'default', placement: RenderPlacement = RenderPlacement.append) {
            const parsed = this.getParsed(templateName)
            if (placement === RenderPlacement.replace) {
                this.element(templateName).innerHTML = ''
            }
            if (placement === RenderPlacement.prepend) {
                this.element(templateName).insertBefore(parsed.doc, this.element(templateName).firstChild)
            }
            else {
                this.element(templateName).appendChild(parsed.doc)
            }
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

