module feather.docs {

    import Template = feather.annotations.Template;
    import Bind = feather.observe.Bind;
    import Widget = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import On = feather.event.On

    @Construct({selector: '.hello-world'})
    class MyApplication extends Widget {

        @Bind() who = 'world'

        init(element: HTMLElement) {
            this.render('default')
        }

        @On({event: 'click', selector: 'button'})
        click() {
            this.who = 'everyone'
        }

        @Template('default')
        protected getBaseTemplate() {
            return `Hello {{who}}! <button>Change</button>`
        }
    }
}
