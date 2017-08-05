module demo {

    import Widget = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import Template = feather.annotations.Template;
    import Bind = feather.observe.Bind;

    @Construct({selector: '.booleans'})
    export class Booleans extends Widget {

        @Bind()
        booleanA = true

        @Bind()
        booleanB = false


        init(element: HTMLElement) {
            this.render('default')
        }

        yesno(bool: boolean) {
            return bool ? 'yes' : 'no'
        }

        truefalse(bool: boolean) {
            return bool ? 'true' : 'false'
        }

        toSelected(bool: boolean) {
            return bool ? 'selected' : undefined
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`
                <h1>Booleans</h1>
                <table>
                    <tr>
                        <th>Property</th>
                        <th>Attribute</th>
                        <th>Text</th>
                        <th>Class</th>
                    </tr>
                    <tr>
                        <td class="delimiter" colspan="4">No formatters</td>
                    </tr>
                    <tr class="no-formatters">
                        <td {{booleanA}} {{booleanB}}></td>
                        <td data-prop-a="{{booleanA}}" data-prop-b="{{booleanB}}"></td>
                        <td>Not supported</td>
                        <td class="">Not supported</td>
                    </tr>
                    <tr>
                        <td class="delimiter" colspan="4">With formatters</td>
                    </tr>
                    <tr class="formatters">
                        <td {{booleanA:toSelected}}></td>
                        <td data-prop-a="{{booleanA:yesno}}" data-prop-b="{{booleanB:truefalse}}"></td>
                        <td>Text: {{booleanA:yesno}} {{booleanB:truefalse}}</td>
                        <td class="other {{booleanA:toSelected}} class"></td>
                    </tr>
                </table>
            `)
        }
    }
}
