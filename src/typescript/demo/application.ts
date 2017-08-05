module demo {

    import Widget    = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import Template  = feather.annotations.Template;
    import Bind      = feather.observe.Bind;
    import On        = feather.event.On;
    import Rest      = feather.xhr.Rest;
    import Subscribe = feather.hub.Subscribe;
    import Route     = feather.routing.Route;

    export enum FilterState {
        ALL,
        TRUE,
        FALSE,
        WIDGET
    }

    export enum SortState {
        ON,
        OFF,
        BOTH
    }

    @Construct({selector: '.application', singleton: true})
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

        @Bind({templateName: 'simple', changeOn: ['sortState']})
        sortTestArray: ArrayElement[] = [
            new ArrayElement(true,  'a'),
            new ArrayElement(true,  'b'),
            new ArrayElement(false, 'c'),
            new ArrayElement(false, 'd')
        ]

        sortState: SortState = SortState.BOTH
        filterState: FilterState = FilterState.ALL

        init(element: HTMLElement) {
            this.render('default')
            window['app'] = this;
        }

        @Rest({url: '/test-{{data.x}}.json'})
        fetch(data?: any) {
            console.log(data)
        }

        @Subscribe('xhr-failure')
        loadError(err: string|Event) {
            console.log(err)
        }

        @Subscribe('singleton-ping')
        singletonEvent(data: any) {
            this.triggerSingleton('singleton-pong', data)
        }

        @Subscribe('singleton-event-noop')
        singletonEventNoop(data: any) {
            // ignore
        }

        arrayFilter() {
            if (this.filterState === FilterState.ALL) {
                return (arrEl: ArrayElement) => true
            } else if (this.filterState === FilterState.TRUE) {
                return (arrEl: ArrayElement) => arrEl.booleanA
            } else if (this.filterState === FilterState.FALSE) {
                return (arrEl: ArrayElement) => !arrEl.booleanA
            } else if (this.filterState === FilterState.WIDGET) {
                return (arrEl: ArrayElement) => arrEl.childWidgets[0]['name'].startsWith('Item')
            }
        }

        sortFilter() {
            if (this.sortState === SortState.BOTH) {
                return (arrEl: ArrayElement) => true
            } else if (this.sortState === SortState.ON) {
                return (arrEl: ArrayElement) => arrEl.booleanA
            } else if (this.sortState === SortState.OFF) {
                return (arrEl: ArrayElement) => !arrEl.booleanA
            }
        }

        printStuff() {
            return 'parent-text'
        }

        countTruthy() {
            return this.filteredList.reduce((p, c) => p + (c.booleanA ? 1 : 0), 0)
        }

        @Template('default')
        protected getBaseTemplate() {
            return (`
                <div class="booleans"/>
                <div class="strings"/>
                <div class="arrays"/>
                <ul id="filtered-list" {{filteredList:arrayFilter}} truthy="{{filteredList:countTruthy}}"/>
                <ul id="sorted-list" {{sortTestArray:sortFilter}}/>
                <AttributeWidget id="aw1" text="{'a'+'b'}" bool="{true}" func="{this.printStuff}" number="{3+1}"/>
                <AttributeWidget id="aw2" text={this.printStuff()} bool={false} func={this.printStuff} number={5}/>
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
