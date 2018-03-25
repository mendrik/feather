module feather.event {

    import selectorMatches             = feather.dom.selectorMatches
    import collectAnnotationsFromArray = feather.objects.collectAnnotationsFromArray
    import MediaQueryAware             = feather.media.MediaQueryAware
    import ensure                      = feather.objects.ensure
    import merge                       = feather.objects.merge
    import isUndef                     = feather.functions.isUndef
    import TypedMap                    = feather.types.TypedMap
    import values                      = feather.objects.values

    export enum Scope {
        Direct,
        Delegate
    }

    export interface EventConfig {
        event:           string // supports multiple space-separated events
        scope?:          Scope
        selector?:       string
        preventDefault?: boolean
        bubble?:         boolean
        forTemplate?:    string
    }

    export interface Handler extends EventConfig {
        method: string
    }

    export type HandlersRegistry = {[s: number]: WeakMap<EventAware, Handler[]>}
    export type HandlersMap      = {[s: number]: Handler[]}

    const eventHandlers: HandlersRegistry = {
        [Scope.Direct]:   new WeakMap<EventAware, Handler[]>(),
        [Scope.Delegate]: new WeakMap<EventAware, Handler[]>()
    }

    interface Listener {
        event: string,
        fn:    EventListenerOrEventListenerObject
    }

    const listenerDeregistry = new WeakMap<Element, Listener[]>()

    export let addListener = (el: Element, event: string, listener: EventListenerOrEventListenerObject) => {
        el.addEventListener(event, listener)
        ensure(listenerDeregistry, el, [{event: event, fn: listener}])
    }

    function attachDelegatedEvent(context: EventAware, forTemplate: string, event: string, handlers: Handler[]) {
        const root = context.element(forTemplate)
        addListener(root, event, (ev: Event) => {
            let el: HTMLElement = ev.target as HTMLElement
            do {
                for (const handler of handlers) {
                    if (el.nodeType === Node.ELEMENT_NODE && (!handler.selector && el === root || selectorMatches(el, handler.selector))) {
                        if (handler.preventDefault) {
                            ev.preventDefault()
                        }
                        if (!handler.bubble) {
                            ev.stopImmediatePropagation()
                        }
                        context[handler.method].call(context, ev, el)
                    }
                }
                if (el === root) {
                    break
                }
            } while (el = el.parentElement)
        })
    }

    export class EventAware extends MediaQueryAware {
        private _element: TypedMap<Element> = {}

        element(forTemplate: string = 'default'): Element {
            return this._element[forTemplate] || this._element['default']
        }

        setElement(forTemplate: string = 'default', element: Element) {
            return this._element[forTemplate] = element
        }

        allElements(): Element[] {
            return values(this._element)
        }

        attachEvents(forTemplate: string = 'default') {
            this.attachDelegates(forTemplate, this.handlers(Scope.Delegate))
            this.attachDirect(forTemplate, this.handlers(Scope.Direct))
        }

        handlers = (scope: Scope): HandlersMap =>
            collectAnnotationsFromArray(eventHandlers[scope], this)
            .reduce((p, c: Handler) => merge(p, {[c.event]: [c]}), {})

        attachDirect(forTemplate: string, handlerMap: HandlersMap) {
            Object.keys(handlerMap).forEach(event => {
                const handlers: Handler[] = handlerMap[event]
                for(const handler of handlers) {
                    const root = this.element(forTemplate)
                    const el = handler.selector ? root.querySelector(handler.selector) : root
                    if (el) {
                        addListener(el, event, (ev) => {
                            if (handler.preventDefault) {
                                ev.preventDefault()
                            }
                            if (!handler.bubble) {
                                ev.stopImmediatePropagation()
                            }
                            return this[handler.method].call(this, ev, el)
                        })
                    }
                    else {
                        console.warn(`${handler.selector} didn't match anything inside the template`)
                    }
                }
                this.eventRegistered(this, forTemplate, event, handlers, Scope.Direct)
            })
        }

        attachDelegates(forTemplate: string, handlerMap: HandlersMap) {
            Object.keys(handlerMap).forEach(event => {
                const handlers = handlerMap[event]
                attachDelegatedEvent(this, forTemplate, event, handlers)
                this.eventRegistered(this, forTemplate, event, handlers, Scope.Delegate)
            })
        }

        // noinspection JSUnusedLocalSymbols
        eventRegistered(context: any, forTemplate: string, event: string, handlers: Handler[], scope: Scope) {
            // use for whatever
        }

        cleanUp() {
            super.cleanUp()
            this.allElements().forEach(element => {
                const listeners = listenerDeregistry.get(element)
                if (listeners) {
                    for (const l of listeners) {
                        element.removeEventListener(l.event, l.fn)
                    }
                    listenerDeregistry.delete(element)
                }
            })
        }
    }

    export let On = (ec: EventConfig) => (proto: EventAware, method: string) => {
        const scope = isUndef(ec.scope) ? Scope.Delegate : ec.scope
        const handlers = ensure(eventHandlers[scope], proto, [])
        ec.event.split(/\s+/).forEach(e =>
            handlers.push({
                event: e,
                method: method,
                preventDefault: ec.preventDefault,
                bubble: ec.bubble,
                scope: scope,
                selector: ec.selector
            })
        )
    }
}
