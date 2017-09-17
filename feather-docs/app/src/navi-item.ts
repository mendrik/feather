module feather.docs {


    import Widget = feather.core.Widget
    import Template = feather.annotations.Template
    import Bind = feather.observe.Bind

    export class NaviItem extends Widget {

        @Bind() text
        @Bind() link

        constructor(link: string, text: string) {
            super()
            this.link = link
            this.text = text
        }

        @Template()
        markup() {
            return `<li><a href="{{link}}">{{text}}</a></li>`
        }

    }
}
