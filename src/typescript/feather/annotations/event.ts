module feather.event {

    import selectorMatches             = feather.dom.selectorMatches
    import collectAnnotationsFromArray = feather.objects.collectAnnotationsFromArray
    import MediaQueryAware             = feather.media.MediaQueryAware

    export enum Scope {
        Direct,
        Delegate
    }

    export interface EventConfig {
        event: string // supports multiple event when separated with spaces
        scope?: Scope
        selector?: string
        preventDefault?: boolean
        bubble?: boolean
    }

    export interface Handler extends EventConfig {
        method: string
    }

    export type HandlersRegistry = {[s: number]: WeakMap<EventAware, Handler[]>}
    export type HandlersMap = {[s: number]: Handler[]}

    const eventHandlers: HandlersRegistry = {
        [Scope.Direct]: new WeakMap<EventAware, Handler[]>(),
        [Scope.Delegate]: new WeakMap<EventAware, Handler[]>(),
    }

    interface Listener {
        event: string,
        fn: EventListenerOrEventListenerObject
    }

    const listenerDeregistry = new WeakMap<HTMLElement, Listener[]>()

    export let addListener = (el: HTMLElement, event: string, listener: EventListenerOrEventListenerObject) => {
        el.addEventListener(event, listener)
        let listeners = listenerDeregistry.get(el)
        if (!listeners) {
            listeners = []
            listenerDeregistry.set(el, listeners)
        }
        listeners.push({event: event, fn: listener})
    }

    function attachDelegatedEvent(context: EventAware, event: string, handlers: Handler[]) {
        const root = context.element;
        addListener(root as HTMLElement, event, (ev: Event) => {
            let el: HTMLElement = ev.target as HTMLElement
            do {
                for (const handler of handlers) {
                    if (el.nodeType === Node.ELEMENT_NODE && (!handler.selector || selectorMatches(el, handler.selector))) {
                        if (handler.preventDefault) {
                            ev.preventDefault()
                        }
                        context[handler.method].call(context, ev, el)
                    }
                }
                if (el === root) {
                    break;
                }
            } while (el = el.parentElement)
        })
    }

    export class EventAware extends MediaQueryAware {
        element: Element

        attachEvents() {
            this.attachDelegates(this.handlers(Scope.Delegate));
            this.attachDirect(this.handlers(Scope.Direct));
        }

        private handlers(scope: Scope): HandlersMap {
            const handlers = collectAnnotationsFromArray(eventHandlers[scope], this),
                  map = {}
            handlers.reduce((p, c) => {
                const e = c.event;
                if (!p[e]) {
                    p[e] = []
                }
                p[e].push(c)
                return p;
            }, map)
            return map
        }

        attachDirect(handlerMap: HandlersMap) {
            const root = this.element;
            Object.keys(handlerMap).forEach(event => {
                const handlers: Handler[] = handlerMap[event]
                for(const handler of handlers) {
                    const el = handler.selector ? root.querySelector(handler.selector) : root
                    if (el) {
                        addListener(el as HTMLElement, event, (ev) => {
                            if (handler.preventDefault) {
                                ev.preventDefault()
                            }
                            if (!handler.bubble) {
                                ev.stopImmediatePropagation()
                            }
                            return this[handler.method].call(this, ev, el)
                        })
                    } else {
                        console.warn(`${handler.selector} didn't match anything inside the template`)
                    }
                }
                this.eventRegistered(this, event, handlers, Scope.Direct)
            })
        }

        attachDelegates(handlerMap: HandlersMap) {
            Object.keys(handlerMap).forEach(event => {
                const handlers = handlerMap[event]
                attachDelegatedEvent(this, event, handlers)
                this.eventRegistered(this, event, handlers, Scope.Delegate)
            })
        }

        eventRegistered(context: any, event: string, handler: Handler[], scope: Scope) {
            // use for whatever
        }

        cleanUp() {
            super.cleanUp()
            const listeners = listenerDeregistry.get(this.element as HTMLElement)
            if (listeners) {
                listeners.forEach(l => this.element.removeEventListener(l.event, l.fn))
                listenerDeregistry.delete(this.element as HTMLElement)
            }
        }
    }

    export let On = (ec: EventConfig) => (proto: EventAware, method: string) => {
        const scope = typeof ec.scope === 'undefined' ? Scope.Delegate : ec.scope
        let handlers = eventHandlers[scope].get(proto)

        if (!handlers) {
            eventHandlers[scope].set(proto, handlers = [] as Handler[])
        }

        ec.event.split(/\s+/).forEach(e =>
            handlers.push({
                event: e,
                method: method,
                preventDefault: ec.preventDefault,
                bubble: ec.bubble,
                scope: scope,
                selector: ec.selector
            } as Handler)
        )
    }
}
