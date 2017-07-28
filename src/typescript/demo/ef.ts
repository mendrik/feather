module demo {

    import Widget    = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import Template  = feather.annotations.Template;
    import On        = feather.event.On;
    import Rest      = feather.xhr.Rest;
    import Method    = feather.xhr.Method;
    import Subscribe = feather.hub.Subscribe;

    @Construct({selector: '.extra-features', singleton: true})
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

        notifySingleton() {
            this.triggerSingleton('singleton-ping', 'data')
        }

        @Subscribe('singleton-pong')
        receivePong(data: any) {
        }

        @Subscribe('message-up')
        receiveMessageFromChild(val: string) {
            //
        }
    }
}
