module feather.docs {


    import Widget = feather.core.Widget
    import Template = feather.annotations.Template
    import Construct = feather.annotations.Construct
    import Media = feather.media.Media

    @Construct({selector: '.responsive'})
    export class Responsive extends Widget {

        @Media('(max-width: 768px)')
        renderMobile() {
            this.render('mobile', true)
        }

        @Media('(min-width: 769px)')
        renderDesktop() {
            this.render('desktop', true)
        }

        @Template('mobile')
        markupMobile() {
            return `Mobile version`
        }

        @Template('desktop')
        markupDesktop() {
            return `Desktop version`
        }

    }
}
