module feather.event {

    import TypedMap        = feather.types.TypedMap
    import selectorMatches = feather.dom.selectorMatches;
    import ValidRoot       = feather.types.ValidRoot;
    import HTML = feather.types.HTML;

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

    let eventHandlers: HandlersRegistry = {
        [Scope.Direct]: new WeakMap<EventAware, Handler[]>(),
        [Scope.Delegate]: new WeakMap<EventAware, Handler[]>(),
    }

    interface Listener {
        event: string,
        fn: EventListenerOrEventListenerObject
    }

    let listenerDeregistry = new WeakMap<HTMLElement, Listener[]>()

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
        let root = context.element;
        addListener(root as HTMLElement, event, (ev: Event) => {
            let el: HTMLElement = ev.target as HTMLElement
            do {
                for (let handler of handlers) {
                    if (el.nodeType === 1 && (!handler.selector || selectorMatches(el, handler.selector))) {
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

    export class EventAware {
        element: Element

        attachEvents() {
            this.attachDelegates(this.handlers(Scope.Delegate));
            this.attachDirect(this.handlers(Scope.Direct));
        }

        private handlers(scope: Scope): HandlersMap {
            let handlers = eventHandlers[scope].get(Object.getPrototypeOf(this)),
                map = {}
            if (handlers) {
                handlers.reduce((p, c) => {
                    let e = c.event;
                    if (!p[e]) {
                        p[e] = []
                    }
                    p[e].push(c)
                    return p;
                }, map)
            }
            return map
        }

        attachDirect(handlerMap: HandlersMap) {
            let root = this.element;
            Object.keys(handlerMap).forEach(event => {
                let handlers: Handler[] = handlerMap[event]
                for(let handler of handlers) {
                    let el = root
                    if (handler.selector) {
                        el = el.querySelector(handler.selector)
                    }
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
                let handlers = handlerMap[event]
                attachDelegatedEvent(this, event, handlers)
                this.eventRegistered(this, event, handlers, Scope.Delegate)
            })
        }

        eventRegistered(context: any, event: string, handler: Handler[], scope: Scope) {
            // use for whatever
        }

        cleanUp() {
            let listeners = listenerDeregistry.get(this.element as HTMLElement);
            if (listeners) {
                listeners.forEach(l => this.element.removeEventListener(l.event, l.fn))
                listenerDeregistry.delete(this.element as HTMLElement)
            }
        }
    }

    export let On = (ec: EventConfig) => (proto: EventAware, method: string) => {
        let scope = typeof ec.scope === 'undefined' ? Scope.Delegate : ec.scope,
            handlers = eventHandlers[scope].get(proto)

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

