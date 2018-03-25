module feather.hub {

    import TypedMap      = feather.types.TypedMap
    import EventAware    = feather.event.EventAware
    import ensure        = feather.objects.ensure
    import collect       = feather.objects.collectAnnotationsFromTypeMap
    import WidgetFactory = feather.boot.WidgetFactory

    export const subscribers    = new WeakMap<any, TypedMap<string[]>>()

    export abstract class Subscribable extends EventAware {
        parentWidget: Subscribable
        childWidgets: Array<Subscribable> = []

        // noinspection JSUnusedGlobalSymbols
        triggerUp(event: string, data?: any) {
            this.trigger(event, data)
            if (this.parentWidget) {
                this.parentWidget.triggerUp(event, data)
            }
        }

        // noinspection JSUnusedGlobalSymbols
        triggerSingleton(event: string, data?: any) {
            WidgetFactory.singletonRegistry.forEach(w => w.trigger(event, data))
        }

        triggerDown(event: string, data?: any) {
            this.trigger(event, data)
            if (this.childWidgets) {
                for (const child of this.childWidgets) {
                    child.triggerDown(event, data)
                }
            }
        }

        private trigger(event: string, data?: any) {
            const subs = collect(subscribers, this)[event]
            if (subs) {
                for (const method of subs) {
                    Object.getPrototypeOf(this)[method].call(this, data)
                }
            }
        }
    }

    export let Subscribe = (event: string, animationFrame?: boolean) =>
        (proto: Subscribable, method: string, desc: PropertyDescriptor) => {
        if (animationFrame === true) {
            const old = desc.value,
                  args = []
            desc.value = function (arg) {
                const context = this
                args.push(arg)
                requestAnimationFrame(() => {
                    old.call(context, args)
                    args.splice(0, args.length)
                })
            }
        }
        ensure(subscribers, proto, {[event]: [method]})
    }
}
