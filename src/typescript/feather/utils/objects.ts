module feather.objects {

    import TypedMap       = feather.types.TypedMap
    import observeArray   = feather.arrays.observeArray
    import TypeOrArray    = feather.types.TypeOrArray
    import ObjectChange   = feather.types.ObjectChange
    import Callback       = feather.types.Callback
    import Factory        = feather.types.Factory

    export const isObject = (obj: any): boolean =>
        (obj !== null && typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]')

    export const values   = <T>(data: TypedMap<T>): T[] =>
        'values' in Object ? Object['values'](data) : Array
            .apply(null, Object.keys(data)
                .map(o => data[o]))

    export function deepValue(obj: {}, path: string): any {
        if (path === '') {
            return obj
        }
        let i, len, pathArr
        for (i = 0, pathArr = path.split('.'), len = pathArr.length; i < len; i++) {
            obj = obj[pathArr[i]]
            if (typeof obj === 'undefined') {
                return
            }
        }
        return obj
    }

    export function setDeepValue(obj: {}, path: string, value: any): any {
        let i, len, pathArr
        for (i = 0, pathArr = path.split('.'), len = pathArr.length - 1; i < len; i++) {
            obj = obj[pathArr[i]] || (obj[pathArr[i]] = {})
        }
        return obj[pathArr.pop()] = value
    }

    export function collectAnnotationsFromArray<T, P extends Object>(map: WeakMap<P, T[]>, start: P): T[] {
        if (typeof start === 'undefined') {
            return []
        }
        const proto    = Object.getPrototypeOf(start),
              handlers = map.get(proto) || []
        if (proto) {
            handlers.push(...collectAnnotationsFromArray(map, proto))
        }
        return handlers
    }

    /**
     * deep merge objects and if some values are arrays, merge those accordingly
     * @param a
     * @param b
     * @returns {any}
     */
    export const merge = (a: any = {}, b: any) => {
        Object.keys(b).forEach(k => {
            const ak = a[k],
                  bk = b[k]
            if (Array.isArray(ak)) {
                ak.push(...bk)
            } else if (isObject(ak)) {
                merge(ak, bk)
            } else {
                a[k] = bk
            }
        })
    }

    export function collectAnnotationsFromTypeMap<T, P extends Object>(map: WeakMap<P, TypedMap<TypeOrArray<T>>>, start: P): TypedMap<TypeOrArray<T>> {
        if (typeof start === 'undefined') {
            return {}
        }
        const proto = Object.getPrototypeOf(start)
        const handlers: TypedMap<TypeOrArray<T>> = map.get(proto) || {}
        if (proto) {
            merge(handlers, collectAnnotationsFromTypeMap(map, proto))
        }
        return handlers
    }

    const objectCallbacks = new WeakMap<any, TypedMap<Array<ObjectChange>>>()

    const ensureListeners = (obj: {}, property: string, callback: ObjectChange) =>
        ensure(objectCallbacks, obj, {[property]: [callback]})[property]

    const addPropertyListener = (obj: {}, property: string, callback: Callback) => {
        const callbacks = ensureListeners(obj, property, callback),
              desc = Object.getOwnPropertyDescriptor(obj, property)
        if (typeof desc === 'undefined' ||
           (typeof desc.set === 'undefined' && desc.writable)) {
            let val = obj[property]
            const call = () => callbacks.forEach(cb => cb(val))
            Object.defineProperty(obj, property, {
                get: () => val,
                set: (newVal) => {
                    if (val instanceof Object) {
                        objectCallbacks.delete(val)
                    }
                    val = newVal
                    listenToObjectOrArray(val, call)
                    call()
                    return val
                }
            })
            listenToObjectOrArray(val, call)
        }
    }

    export const createObjectPropertyListener = (obj: {}, path: string, callback: ObjectChange) => {
        addPropertyListener(obj, path.split('.').shift(), () => callback(deepValue(obj, path)))
    }

    const listenToObjectOrArray = (obj: any, callback: Callback) => {
        if (isObject(obj)) {
            Object.keys(obj).forEach(k =>
                addPropertyListener(obj, k, callback)
            )
        } else if (Array.isArray(obj)) {
            obj.forEach(i => listenToObjectOrArray(i, callback))
            observeArray(obj, {
                sort: callback,
                splice: (s, d, addedItems: any[], deletedItems: any[]) => {
                    callback()
                    addedItems.forEach(i =>
                       listenToObjectOrArray(i, callback)
                    )
                    deletedItems.forEach(i => objectCallbacks.delete(i))
                }
            })
        }
    }

    export const ensure = <T>(map: WeakMap<{}, T>,
                              obj: any,
                              defaultValue: any): T => {
        let lookup: any = map.get(obj)
        if (!lookup) {
            map.set(obj, lookup = defaultValue)
        } else if (Array.isArray(lookup) && Array.isArray(defaultValue)) {
            lookup.push(...defaultValue)
        } else if (isObject(lookup)) {
            merge(lookup, defaultValue)
        }
        return lookup
    }

    export const getOrCreate = <T>(store: Map<any, T>, property: string, factory: Factory<T>) =>
        store[property] || (store[property] = factory())
}
