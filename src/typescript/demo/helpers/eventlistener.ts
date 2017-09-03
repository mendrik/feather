module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind
    import On        = feather.event.On

    @Construct({selector: 'EventListener', attributes: ['children']})
    export class EventListener extends Widget {

        @Bind() children = [] as EventListener[]

        constructor(children: number) {
            super()
            if (children > 0) {
                this.children.push(
                    ...feather.arrays.range(1, children).map(i =>
                        new EventListener(0)
                    )
                )
            }
            window['event-test'] = this
        }

        init() {
            if (this.children.length !== 0) {
                this.render('default')
            }
        }

        @On({event: 'click', selector: 'button'})
        buttonClick() {
            console.log('button');
        }

        @On({event: 'click'})
        rootClick() {
            console.log('root click');
        }

        @On({event: 'click', selector: 'span'})
        spanClick() {
            console.log('span click');
        }

        @On({event: 'click', selector: 'i', scope: feather.event.Scope.Direct})
        iconClick() {
            console.log('icon click');
        }

        @Template()
        getBaseTemplate() {
            return (`
                <div class="root">
                    <button>Click me!</button>
                    <span><i>Icon</i> Span click</span>                
                    <ul {{children}}/>
                </div>
            `)
        }
    }
}
