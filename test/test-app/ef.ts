module testApp {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import SimpleMap = feather.types.SimpleMap
    import Bind      = feather.observe.Bind
    import On        = feather.event.On
    import Rest      = feather.xhr.Rest
    import Maybe     = feather.types.Maybe
    import Method    = feather.xhr.Method
    import Subscribe = feather.hub.Subscribe
    import Route     = feather.routing.Route

    @Construct({selector: '.extra-features'})
    export class ExtraFeatures extends Widget {

        post = {
            data: {
                test: 1
            }
        }

        init(element: HTMLElement) {
            this.render('default')
            window['ef'] = this
        }

        @Rest({url: '/get/{{post.data.test}}'})
        getData(data?: any) {
            //
        }

        @Rest({url: '/post/{{post.data.test}}', method: Method.POST, body: 'post.data'})
        postData(data?: any) {
            //
        }

        @Subscribe('xhr-failure')
        loadError(err: string|Event) {
            console.log(err)
        }

        @Template('default')
        protected getBaseTemplate() {
            return 'Rendered<div class="widget" name="sub-widget"></div>'
        }

        @Route('/')
        entry() {
            //
        }

        @Route('/:path')
        subsection(routes: SimpleMap) {
            //
        }

        @On({event: 'click', selector: 'td'})
        click() {
            console.log('click')
        }

        sendMessage() {
            this.triggerDown('message-down', 'down')
        }

        @Subscribe('message-down')
        receiveMessage(val: string) {
            //
        }

        @Subscribe('message-up')
        receiveMessageFromChild(val: string) {
            //
        }
    }
}
