module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import HTML      = feather.types.HTML
    import Bind      = feather.observe.Bind
    import On        = feather.event.On

    export class ArrayElement extends Widget {

        @Bind() booleanA = true
        @Bind() stringA = 'first'
        @Bind() listX = [1, 2, 3]

        constructor(booleanA: boolean, stringA: string) {
            super();
            this.booleanA = booleanA;
            this.stringA = stringA;
        }

        onoff = (b: boolean) => b ? 'on' : 'off'
        count = (list: number[]) => list.length

        @Template('default')
        protected getBaseTemplate() {
            return (`<li class="ae"><span class="{{booleanA:onoff}}">{{stringA}} listCount:{{listX:count}}</span><div class="widget" name="${this.stringA}"></div></li>`)
        }
    }
}
