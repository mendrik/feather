module testApp {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import HTML      = feather.types.HTML
    import Bind      = feather.observe.Bind
    import On        = feather.event.On
    import Subscribe = feather.hub.Subscribe

    @Construct({selector: '.widget', attributes: ['name']})
    export class SubWidget extends Widget {

        @Bind()
        name: string

        constructor(name: string) {
            super();
            this.name = name
        }

        init(element: HTMLElement) {
            this.render('default')
        }

        @Template('default')
        protected getBaseTemplate() {
            return `<span>Widget {{name}}</span><i></i>`
        }

        @Subscribe('message-down')
        receiveMessage() {
            this.triggerUp('message-up', 'up')
        }

        @On({event: 'click', selector: 'i'})
        click(ev: Event, target: HTMLLIElement) {
           // 
        }

        @On({event: 'click'})
        clickRoot(ev: Event) {
           //
        }

    }
}
