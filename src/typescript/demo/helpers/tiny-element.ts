module demo {

    import Widget    = feather.core.Widget;
    import Template  = feather.annotations.Template;

    export class TinyElement extends Widget {

        @Template()
        protected getBaseTemplate() {
            return `<li></li>`
        }

    }
}
