module feather.docs {


    import Widget = feather.core.Widget
    import Template = feather.annotations.Template
    import Construct = feather.annotations.Construct
    import Media = feather.media.Media

    @Construct({selector: '.responsive'})
    export class Responsive extends Widget {

        @Media('(max-width: 768px)')
        renderMobile() {
            console.log('bla')
            this.render('mobile')
        }

        @Media('(min-width: 769px)')
        renderDesktop() {
            console.log('blub')
            this.render('desktop')
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
