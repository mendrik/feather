module feather.hub {

    import TypedMap   = feather.types.TypedMap
    import EventAware = feather.event.EventAware
    import flatten    = feather.arrays.flatten
    import collectAnnotationsFromTypeMap = feather.objects.collectAnnotationsFromTypeMap

    const subscribers = new WeakMap<Subscribable, TypedMap<Subscriber[]>>()

    export class Subscriber {
        constructor(public event: string, public method: string) {
        }
    }

    export abstract class Subscribable extends EventAware {
        parentWidget: Subscribable
        childWidgets: Array<Subscribable> = []

        triggerUp(event: string, ...data: any[]) {
            feather.hub.Subscribable.trigger(event, this, data)
            if (this.parentWidget) {
                this.parentWidget.triggerUp(event, ...data)
            }
        }

        triggerDown(event: string, ...data: any[]) {
            feather.hub.Subscribable.trigger(event, this, data)
            if (this.childWidgets) {
                this.childWidgets.forEach(child => child.triggerDown(event, ...data))
            }
        }

        private static trigger(event: string, context: Subscribable, ...data: any[]) {
            let subs = collectAnnotationsFromTypeMap(subscribers, context) as TypedMap<Subscriber[]>
            if (subs[event]) {
                for (let sub of subs[event]) {
                    context[sub.method].apply(context, flatten(data))
                }
            }
        }

        cleanUp() {
            super.cleanUp();
            subscribers.delete(this)
        }
    }

    export let Subscribe = (event: string) => (proto: Subscribable, method: string) => {
        let s = subscribers.get(proto)
        if (!s) {
            subscribers.set(proto, s = {})
        }
        if (!s[event]) {
            s[event] = []
        }
        s[event].push(new Subscriber(event, method))
    }
}
