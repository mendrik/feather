module feather.objects {

    import TypedMap      = feather.types.TypedMap
    import observeArray  = feather.arrays.observeArray
    import isFunction    = feather.functions.isFunction

    export const isObject = (obj: any): boolean => (obj !== null && typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]')

    export const values = <T>(data: TypedMap<T>): T[] => 'values' in Object ? Object['values'](data) : Array.apply(null, Object.keys(data).map(o => data[o]))

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
        const proto = Object.getPrototypeOf(start)
        const handlers = map.get(proto) || []
        if (proto) {
            handlers.push(...collectAnnotationsFromArray(map, proto))
        }
        return handlers
    }

    export type TypeOrArray<T> = T[] | T

    export const mergeArrayTypedMap = <T>(a: TypedMap<TypeOrArray<T>>, b: TypedMap<TypeOrArray<T>>) => {
        const target = {}
        Object.keys(a).forEach(k => target[k] = a[k])
        Object.keys(b).forEach(k => {
            if (target[k] && Array.isArray(b[k])) {
                target[k].push(...(b[k] as T[]))
            } else {
                target[k] = b[k]
            }
        })
        return target
    }

    export function collectAnnotationsFromTypeMap<T, P extends Object>(map: WeakMap<P, TypedMap<TypeOrArray<T>>>, start: P): TypedMap<TypeOrArray<T>> {
        if (typeof start === 'undefined') {
            return {}
        }
        const proto = Object.getPrototypeOf(start)
        let handlers: TypedMap<TypeOrArray<T>> = map.get(proto) || {}
        if (proto) {
            handlers = mergeArrayTypedMap(handlers, collectAnnotationsFromTypeMap(map, proto))
        }
        return handlers
    }

    export type ObjectChange = (val: any) => void
    export type Callback = () => void

    const objectCallbacks = new WeakMap<any, TypedMap<Array<ObjectChange>>>()

    const ensureListeners = (obj: {}, property: string, callback: ObjectChange) => {
        let callbacks = objectCallbacks.get(obj)
        if (typeof callbacks === 'undefined') {
            objectCallbacks.set(obj, callbacks = {})
        }
        if (!callbacks[property]) {
            callbacks[property] = []
        }
        callbacks[property].push(callback)
        return callbacks[property]
    }

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
                splice: (s, d, items: any[]) => {
                    callback()
                    items.forEach(i =>
                       listenToObjectOrArray(i, callback)
                    )
                }
            })
        }
    }
}
