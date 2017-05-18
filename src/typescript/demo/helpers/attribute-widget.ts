module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import HTML      = feather.types.HTML
    import Bind      = feather.observe.Bind
    import On        = feather.event.On
    import Subscribe = feather.hub.Subscribe

    @Construct({selector: 'AttributeWidget', attributes: ['text', 'bool', 'func', 'number']})
    export class AttributeWidget extends Widget {

        @Bind() text: string
        @Bind() bool: boolean
        @Bind() number: number
        @Bind() funcResult: string

        constructor(text: string, bool: boolean, func: Function, number: number) {
            super();
            this.text = text
            this.bool = bool
            this.funcResult = func()
            this.number = number
        }

        init() {
            this.render('default')
        }
        
        yesOrNo = (bool: boolean) => bool ? 'yes' : 'no'

        @Template('default')
        protected getBaseTemplate() {
            return (`
                <span text="{{text}}" bool="{{bool:yesOrNo}}" func={{funcResult}} number={{number}} >{{text}}</span>
            `)
        }
    }
}
