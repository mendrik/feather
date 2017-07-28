module demo {

    import Widget = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import Template = feather.annotations.Template;
    import Bind = feather.observe.Bind;
    import Subscribe = feather.hub.Subscribe;

    @Construct({selector: '.arrays'})
    export class Arrays extends Widget {

        @Bind({templateName: 'default'})
        listA = [
            new ArrayElement(true, 'first'),
            new ArrayElement(false, 'second')
        ]

        @Bind({templateName: 'default'})
        listB = []

        init(element: HTMLElement) {
            this.render('default')
        }

        count(list: Widget[]) {
            return list.length
        }

        notZero(list: Widget[]) {
            return this.count(list) !== 0
        }

        yesno(b: boolean) {
            return b ? 'yes' : 'no'
        }

        onoff(b: boolean) {
            return b ? 'on' : 'off'
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`
                <h1>Arrays</h1>
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
                        <td><ul class="listA" {{listA}}></ul><ul class="listB" {{listB}}></ul></td>
                        <td>Not supported</td>
                        <td>Not supported</td>
                        <td>Not supported</td>
                    </tr>
                    <tr>
                        <td class="delimiter" colspan="4">With formatters</td>
                    </tr>
                    <tr class="formatters">
                        <td>Not supported</td>
                        <td data-prop-a="{{listA:count}}" data-prop-b="{{listB:count}}"></td>
                        <td>Text: {{listA:count}} {{listA:notZero:yesno}} {{listB:count}} {{listB:notZero:yesno}}</td>
                        <td class="{{listA:notZero:yesno}} {{listB:notZero:onoff}}"></td>
                    </tr>
                </table>
            `)
        }

        @Subscribe('message')
        receiveMessage() {
            console.log('Message received')
            this.triggerUp('message-up', 1, 2, 3)
        }
    }
}
