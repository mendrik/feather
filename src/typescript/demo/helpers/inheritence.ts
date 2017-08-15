module demo {

    import Widget    = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import Template  = feather.annotations.Template;

    @Construct({selector: 'Inheritence'})
    export class Inheritence extends Widget {

        init() {
            this.render('default')
        }

        @Template()
        protected getBaseTemplate() {
            return (`
                <div id="inherit" test="{{inheritedString}}" length="{{filteredList:size}}">{{inheritedString}}</div>
            `)
        }

        size = (arr: ArrayElement[]) => arr.length
    }
}
