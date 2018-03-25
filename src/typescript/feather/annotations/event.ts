module feather.event {

    import selectorMatches             = feather.dom.selectorMatches
    import collectAnnotationsFromArray = feather.objects.collectAnnotationsFromArray
    import MediaQueryAware             = feather.media.MediaQueryAware
    import ensure                      = feather.objects.ensure
    import merge                       = feather.objects.merge
    import isUndef                     = feather.functions.isUndef

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
        templateName?:   string
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

    function attachDelegatedEvent(context: EventAware, event: string, handlers: Handler[]) {
        const root = context.element
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
        element: Element

        attachEvents(templateName?: string) {
            this.attachDelegates(this.handlers(Scope.Delegate), templateName)
            this.attachDirect(this.handlers(Scope.Direct), templateName)
        }

        handlers = (scope: Scope): HandlersMap =>
            collectAnnotationsFromArray(eventHandlers[scope], this)
            .reduce((p, c: Handler) => merge(p, {[c.event]: [c]}), {})

        attachDirect(handlerMap: HandlersMap, templateName?: string) {
            const root = this.element
            Object.keys(handlerMap).forEach(event => {
                const handlers: Handler[] = handlerMap[event]
                for(const handler of handlers) {
                    const el = handler.selector ? root.querySelector(handler.selector) : root
                    if (el && handler.templateName === templateName) {
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
                this.eventRegistered(this, event, handlers, Scope.Direct)
            })
        }

        attachDelegates(handlerMap: HandlersMap, templateName?: string) {
            Object.keys(handlerMap).forEach(event => {
                const handlers = handlerMap[event]
                    .filter((h: Handler) => h.templateName === templateName)
                attachDelegatedEvent(this, event, handlers)
                this.eventRegistered(this, event, handlers, Scope.Delegate)
            })
        }

        // noinspection JSUnusedLocalSymbols
        eventRegistered(context: any, event: string, handler: Handler[], scope: Scope) {
            // use for whatever
        }

        cleanUp() {
            super.cleanUp()
            const listeners = listenerDeregistry.get(this.element)
            if (listeners) {
                for (const l of listeners) {
                    this.element.removeEventListener(l.event, l.fn)
                }
                listenerDeregistry.delete(this.element)
            }
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
