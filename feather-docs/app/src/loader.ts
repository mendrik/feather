module feather.docs {

    import Template = feather.annotations.Template
    import Bind = feather.observe.Bind
    import Widget = feather.core.Widget
    import Construct = feather.annotations.Construct
    import On = feather.event.On
    import range = feather.arrays.range

    class Item extends Widget {

        @Bind() order: number

        constructor(i: number) {
            super()
            this.order = i
        }

        @Template()
        itemMarkup() {
            return `<li>Loaded item {{order}}</li>`
        }
    }


    @Construct({selector: '.item-loader'})
    class Loader extends Widget {

        @Bind() items: Item[] = []

        init(element: HTMLElement) {
            this.render('default')
        }

        @On({event: 'click', selector: 'button'})
        click() {
            this.items.push(
                ...range(1, 5).map(i =>
                    new Item(i)
                )
            )
        }

        @Template('default')
        protected getBaseTemplate() {
            return `<button>Load items</button><ul {{items}}/><div class="loading">Loading items...</div>`
        }
    }
}
