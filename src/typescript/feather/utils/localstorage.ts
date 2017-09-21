module feather.observe {

    import Subscribable = feather.hub.Subscribable
    import isFunction   = feather.functions.isFunction
    import TypedMap     = feather.types.TypedMap
    import collect      = feather.objects.collectAnnotationsFromTypeMap
    import ensure       = feather.objects.ensure

    const serializers   = new WeakMap<any, TypedMap<Serializer>>()
    const storeQueue    = new WeakMap<any, any>()


    const getWidgetId = (w: any) => {
        const name = w.id || w.name || w.title || w.constructor.name
        return isFunction(name) ? name() : name
    }

    const getPath = (obj: Subscribable, property: string) => {
        const segments = [property]
        let parent = obj
        do {
            segments.unshift(getWidgetId(parent))
        } while (parent = parent.parentWidget)
        return segments.join('.')
    }

    const store = (parent, property, value) =>
        localStorage.setItem(getPath(parent, property), JSON.stringify({value}))

    export const maybeStore = (parent: Subscribable, property: string, conf: BindProperties, value: any, isArray: boolean) => {
        if (conf && conf.localStorage) {
            if (isArray) {
                if (storeQueue.has(value)) {
                    clearTimeout(storeQueue.get(value))
                }
                storeQueue.set(value, setTimeout(() => {
                    const serializer = collect(serializers, parent)[property]
                    value = value.map(parent[serializer.write])
                    store(parent, property, value)
                }, 80))
            }
            else {
                store(parent, property, value)
            }
        }
    }

    export const loadLocalStorageValue = (binders: WeakMap<any, TypedMap<BindProperties>>, context: Observable) => {
        const boundProperties = collect(binders, context)
        if (boundProperties) {
            Object.keys(boundProperties).forEach(property => {
                if (boundProperties[property].localStorage) {
                    try {
                        const json = localStorage.getItem(getPath(context, property))
                        if (json) {
                            const storedValue = JSON.parse(json).value
                            if (Array.isArray(storedValue)) {
                                const serializer = collect(serializers, context)[property]
                                context[property] = storedValue.map(context[serializer.read])
                            }
                            else {
                                context[property] = storedValue
                            }
                        }
                    } catch (e) {
                        console.warn(e)
                    }
                }
            })
        }
    }

    export const Write = (arrayName: string) => (proto: Observable, method: string) => {
        ensure(serializers, proto, {[arrayName]: {write: method}})
    }

    export const Read = (arrayName: string) => (proto: Observable, method: string) => {
        ensure(serializers, proto, {[arrayName]: {read: method}})
    }
}
