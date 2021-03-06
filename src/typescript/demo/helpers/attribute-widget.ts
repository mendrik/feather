module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind

    @Construct({selector: 'AttributeWidget', attributes: ['text', 'bool', 'func', 'number']})
    export class AttributeWidget extends Widget {

        @Bind() text: string
        @Bind() bool: boolean
        @Bind() number: number
        @Bind() funcResult: string

        constructor(text: string, bool: boolean, func: Function, number: number) {
            super()
            this.text = text
            this.bool = bool
            this.funcResult = func()
            this.number = number
        }

        init() {
            this.render('default')
        }

        @Template('default')
        getBaseTemplate() {
            return (`
                <span text="{{text}}" bool="{{bool:yesOrNo}}" func={{funcResult}} number={{number}} inherited={{inheritedString}}>{{text}}</span>
            `)
        }

        yesOrNo = (bool: boolean) => bool ? 'yes' : 'no'
    }
}
