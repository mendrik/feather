module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import HTML      = feather.types.HTML
    import Bind      = feather.observe.Bind
    import On        = feather.event.On
    import Rest      = feather.xhr.Rest
    import Method    = feather.xhr.Method
    import Subscribe = feather.hub.Subscribe
    import Route     = feather.routing.Route

    export enum FilterState {
        ALL,
        TRUE,
        FALSE
    }

    @Construct({selector: '.application'})
    export class Application extends Widget {

        data = {
            x: 1
        }

        @Bind({templateName: 'default', changeOn: ['filterState']})
        filteredList: ArrayElement[] = [
            new ArrayElement(true, 'ItemA'),
            new ArrayElement(false, 'ItemB'),
            new ArrayElement(true, 'ItemC'),
            new ArrayElement(false, 'ItemD')
        ]

        filterState: FilterState = FilterState.ALL

        init(element: HTMLElement) {
            this.render('default')
            window['app'] = this;
            // this.fetch()
        }

        @Rest({url: '/test-{{data.x}}.json'})
        fetch(data?: any) {
            console.log(data)
        }

        @Subscribe('xhr-failure')
        loadError(err: string|Event) {
            console.log(err)
        }

        arrayFilter() {
            if (this.filterState === FilterState.ALL) {
                return (todo: ArrayElement) => true
            } else if (this.filterState === FilterState.TRUE) {
                return (todo: ArrayElement) => todo.booleanA
            } else if (this.filterState === FilterState.FALSE) {
                return (todo: ArrayElement) => !todo.booleanA
            }
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`
                <div class="booleans"></div>                
                <div class="strings"></div>                
                <div class="arrays"></div>
                <ul class="widget-array" {{filteredList:arrayFilter}}></ul>                                
            `)
        }

        @Route('/')
        entry() {
            console.log('Root route')
        }

        @Route('/:path')
        subsection() {
            console.log('Section route')
        }

        @On({event: 'click', selector: 'td'})
        click() {
            console.log('click')
            this.triggerDown('message')
        }

        @Subscribe('message-up')
        receive123(a, b, c) {
            console.log(a,b,c)
        }
    }
}
