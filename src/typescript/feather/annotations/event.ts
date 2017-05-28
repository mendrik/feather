module feather.event {

    import TypedMap = feather.types.TypedMap
    import selectorMatches = feather.dom.selectorMatches;
    import ValidRoot = feather.types.ValidRoot;

    export enum Scope {
        Window,
        Document,
        Body
    }

    let getScope = (scope: Scope): EventTarget => {
        switch (scope) {
            case Scope.Window: return window
            case Scope.Document: return document
            case Scope.Body: return document.body
        }
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

    let eventHandlers = new WeakMap<EventAware, Handler[]>()

    function attachEvent(context: EventAware, handler: Handler, scope: EventTarget, event: string) {
        scope.addEventListener(event, (ev: Event) => {
            if (typeof handler.scope === 'undefined') {
                let el: HTMLElement = ev.target as HTMLElement
                do {
                    if (el.nodeType === 1 && (!handler.selector || selectorMatches(el, handler.selector))) {
                        if (handler.preventDefault) {
                            ev.preventDefault()
                        }
                        ev.stopPropagation();
                        return context[handler.method].call(context, ev, el)
                    }
                    if (el === context.element) {
                        break;
                    }
                } while (el = el.parentElement)
            } else {
                return context[handler.method].call(context, ev)
            }
        })
    }

    export class EventAware {
        element: HTMLElement

        attachEvents(element: HTMLElement) {
            let handlers = eventHandlers.get(Object.getPrototypeOf(this))
            if (handlers) {
                for (let handler of handlers) {
                    let hasNoScope = typeof handler.scope === 'undefined',
                        scope: EventTarget = hasNoScope ? element : getScope(handler.scope),
                        events = handler.event.split(' ')
                    for (let event of events) {
                        attachEvent(this, handler, scope, event)
                        if (hasNoScope) {
                            this.eventRegistered(this, event, handler)
                        }
                    }
                }
                return handlers
            }
        }

        eventRegistered(context: any, event: string, handler: Handler) {
            // use for whatever
        }

    }

    export let On = (ec: EventConfig) => (proto: EventAware, method: string) => {

        let handlers = eventHandlers.get(proto)

        if (!handlers) {
            eventHandlers.set(proto, handlers = [] as Handler[])
        }

        handlers.push({
            event: ec.event,
            method: method,
            preventDefault: ec.preventDefault,
            scope: ec.scope,
            selector: ec.selector
        } as Handler)
    }
}

