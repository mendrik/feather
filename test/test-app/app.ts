/// <reference path="../../out/javascripts/feather.d.ts" />
module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import HTML      = feather.types.HTML
    import Bind      = feather.observe.Bind
    import On        = feather.event.On
    import Rest      = feather.xhr.Rest
    import Maybe     = feather.types.Maybe
    import Method    = feather.xhr.Method
    import Subscribe = feather.hub.Subscribe
    import Route     = feather.routing.Route

    export enum FilterState {
        ALL,
        TRUE,
        FALSE,
        WIDGET
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
            new ArrayElement(true, 'ObjectC'),
            new ArrayElement(false, 'ItemD')
        ]

        filterState: FilterState = FilterState.ALL

        init(element: HTMLElement) {
            this.render('default')
            window['app'] = this;
        }

        filteredArray() {
            if (this.filterState === FilterState.ALL) {
                return (todo: ArrayElement) => true
            } else if (this.filterState === FilterState.TRUE) {
                return (todo: ArrayElement) => todo.booleanA
            } else if (this.filterState === FilterState.FALSE) {
                return (todo: ArrayElement) => !todo.booleanA
            } else if (this.filterState === FilterState.WIDGET) {
                return (todo: ArrayElement) => todo.childWidgets[0]['name'].startsWith('Item')
            }
        }

        countTruthy() {
            return this.filteredList.reduce((p, c) => p + (c.booleanA ? 1 : 0), 0)
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`
            <div class="booleans"></div>                
            <div class="strings"></div>                
            <div class="arrays"></div>        
            <ul id="filtered-list" {{filteredList:filteredArray}} truthy="{{filteredList:countTruthy}}"></ul>
            `)
        }
    }
}
