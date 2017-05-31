module feather.event {

    import TypedMap = feather.types.TypedMap
    import selectorMatches = feather.dom.selectorMatches;
    import ValidRoot = feather.types.ValidRoot;

    export enum Scope {
        Direct,
        Delegate
    }

    export interface EventConfig {
        event: string // supports multiple event when separated with spaces
        scope?: Scope
        selector?: string
        preventDefault?: boolean
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

    function attachDelegatedEvent(context: EventAware, event: string, handlers: Handler[]) {
        let root = context.element;
        root.addEventListener(event, (ev: Event) => {
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
                let handlers = handlerMap[event]
                for(let handler of handlers) {
                    let el = root
                    if (handler.selector) {
                        el = el.querySelector(handler.selector)
                    }
                    el.addEventListener(event, (ev) => {
                        if (handler.preventDefault) {
                            ev.preventDefault()
                        }
                        return context[handler.method].call(context, ev, el)
                    })
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

    }

    export let On = (ec: EventConfig) => (proto: EventAware, method: string) => {

        let scope = ec.scope || Scope.Delegate,
            handlers = eventHandlers[scope].get(proto)

        if (!handlers) {
            eventHandlers[scope].set(proto, handlers = [] as Handler[])
        }

        ec.event.split(/\s+/).forEach(e =>
            handlers.push({
                event: e,
                method: method,
                preventDefault: ec.preventDefault,
                scope: scope,
                selector: ec.selector
            } as Handler)
        )
    }
}

