module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind
    import Computed  = feather.observe.Computed

    @Construct({selector: 'Computed'})
    export class ComputedWidget extends Widget {

        @Bind() open = false
        @Bind() arr: TinyElement[] = []

        constructor() {
            super()
            window['computed'] = this
        }

        init() {
            this.arr.push(new TinyElement(), new TinyElement(), new TinyElement())
            this.render('default')
        }

        public add() {
            this.arr.push(new TinyElement())
        }

        @Template()
        protected getBaseTemplate() {
            return (`
                <div id="computed">
                    {{fullname:uppercase}}
                </div>
            `)
        }

        @Computed('open', 'arr')
        fullname = () => `${this.open ? 'open' : 'closed'} ${this.arr.length}`

        uppercase = (text: string) => text.toUpperCase()
    }
}
