module feather.docs {

    import Template = feather.annotations.Template;
    import Bind = feather.observe.Bind;
    import Widget = feather.core.Widget;
    import Construct = feather.annotations.Construct;

    @Construct({selector: '.hello-world'})
    class MyApplication extends Widget {

        @Bind() who = 'world'

        init(element: HTMLElement) {
            this.render('default')
            setTimeout(function () {
                this.who = "everyone"
            }.bind(this), 2000)
        }

        @Template('default')
        protected getBaseTemplate() {
            return `Hello {{who}}!`
        }
    }

}
