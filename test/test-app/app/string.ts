module testApp {

    import Widget    = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import Template  = feather.annotations.Template;
    import On        = feather.event.On;
    import Bind      = feather.observe.Bind;

    @Construct({selector: '.strings'})
    export class Strings extends Widget {

        @Bind()
        stringA = 'first'

        @Bind()
        stringB = 'second'


        init(element: HTMLElement) {
            this.render('default')
        }

        uppercase(str: string) {
            return str.toUpperCase()
        }

        reverse(str: string) {
            return str.split('').reverse().join('');
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`
                <h1>Strings</h1>
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
                        <td {{stringA}} {{stringB}}></td>
                        <td data-prop-a="{{stringA}}" data-prop-b="{{stringB}}"></td>
                        <td>Text: {{stringA}} {{stringB}}</td>
                        <td class="{{stringA}} {{stringB}}"></td>
                    </tr>
                    <tr>
                        <td class="delimiter" colspan="4">With formatters</td>
                    </tr>
                    <tr class="formatters">
                         <td {{stringA:uppercase}} {{stringB:reverse}}></td>
                        <td data-prop-a="{{stringA:uppercase}}" data-prop-b="{{stringB:reverse}}"></td>
                        <td>Text: {{stringA:uppercase}} {{stringB:reverse}}</td>
                        <td class="{{stringA:uppercase}} {{stringB:reverse}}"></td>
                    </tr>
                </table>
            `)
        }
    }
}
