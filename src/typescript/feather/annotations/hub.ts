module feather.hub {

    import TypedMap      = feather.types.TypedMap
    import EventAware    = feather.event.EventAware
    import ensure        = feather.objects.ensure
    import collect       = feather.objects.collectAnnotationsFromTypeMap
    import WidgetFactory = feather.boot.WidgetFactory

    const subscribers    = new WeakMap<Subscribable, TypedMap<Subscriber[]>>()

    export class Subscriber {
        constructor(public event: string, public method: string) {
        }
    }

    export abstract class Subscribable extends EventAware {
        parentWidget: Subscribable
        childWidgets: Array<Subscribable> = []

        // noinspection JSUnusedGlobalSymbols
        triggerUp(event: string, ...data: any[]) {
            feather.hub.Subscribable.trigger(event, this, data)
            if (this.parentWidget) {
                this.parentWidget.triggerUp(event, ...data)
            }
        }

        // noinspection JSUnusedGlobalSymbols
        triggerSingleton(event: string, ...data: any[]) {
            WidgetFactory.singletonRegistry.forEach(w => feather.hub.Subscribable.trigger(event, w, data))
        }

        triggerDown(event: string, ...data: any[]) {
            feather.hub.Subscribable.trigger(event, this, data)
            if (this.childWidgets) {
                for (const child of this.childWidgets) {
                    child.triggerDown(event, ...data)
                }
            }
        }

        private static trigger(event: string, context: Subscribable, ...data: any[]) {
            const subs = collect(subscribers, context)
            if (subs[event]) {
                for (const sub of subs[event]) {
                    context[sub.method].apply(context, ...data)
                }
            }
        }

        cleanUp() {
            super.cleanUp()
            subscribers.delete(this)
        }
    }

    export let Subscribe = (event: string) => (proto: Subscribable, method: string) =>
        ensure(subscribers, proto, {[event]: [new Subscriber(event, method)]})
}
