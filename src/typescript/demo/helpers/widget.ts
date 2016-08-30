/// <reference path="../../../../out/javascripts/feather.d.ts" />

module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import HTML      = feather.types.HTML
    import Bind      = feather.observe.Bind
    import On        = feather.event.On

    @Construct({selector: '.widget', attributes: ['name']})
    export class SubWidget extends Widget {

        @Bind() name: string

        constructor(name: string) {
            super();
            this.name = name
        }

        init(element: HTMLElement) {
            this.render('default')
        }

        @Template('default')
        protected getBaseTemplate() {
            return `<span>Widget {{name}}</span>`
        }
    }
}
