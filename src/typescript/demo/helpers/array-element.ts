module demo {

    import Widget    = feather.core.Widget
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind

    export class ArrayElement extends Widget {

        @Bind({affectsArrays: ['filteredList']}) booleanA = true
        @Bind() stringA = 'first'
        @Bind() listX = [1, 2, 3]

        constructor(booleanA: boolean, stringA: string) {
            super()
            this.booleanA = booleanA
            this.stringA = stringA
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`<li class="ae"><span class="{{booleanA:onoff}}">{{stringA}} listCount:{{listX:count}}</span><div class="widget" name="${this.stringA}"></div></li>`)
        }

        @Template('simple')
        protected getSimpleTemplate() {
            return (`<li inherited="{{inheritedString}}" inheritedUpperCase={{inheritedString:toUpperCase}}>{{stringA}}</li>`)
        }

        @Template('minimal')
        protected getMinimalTemplate() {
            return (`<li>{{stringA}}</li>`)
        }

        toUpperCase = (str: string) => str.toUpperCase()
        onoff = (b: boolean) => b ? 'on' : 'off'
        count = (list: number[]) => list.length
    }
}
