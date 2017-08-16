module feather.objects {

    import TypedMap      = feather.types.TypedMap
    import observeArray  = feather.arrays.observeArray
    import isFunction = feather.functions.isFunction;
    import lis = feather.arrays.lis;

    export const isObject = (obj: any): boolean => (obj !== null && typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]')

    export const values = <T>(data: TypedMap<T>): T[] => 'values' in Object ? Object['values'](data) : Array.apply(null, Object.keys(data).map(o => data[o]))

    export function deepValue(obj: {}, path: string): any {
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

    export type ObjectChange = {
        property: string,
        callback: (val: any) => void
    }

    export type Callback = () => void

    const objectCallbacks = new WeakMap<{}, ObjectChange[]>()

    const notifyListeners = (obj, property, val) => {
        const listeners = objectCallbacks.get(obj);
        if (listeners) {
            listeners
                .filter(oc => oc.property === property)
                .forEach(oc => oc.callback(val))
        }
    }

    const notifyOnChange = (obj: {}, property: string, callback: Callback) => {
        let val = obj[property]
        Object.defineProperty(obj, property, {
            get: () => val,
            set: (newVal) => {
                val = newVal
                listenToObjectOrArray(newVal, callback)
                callback()
                return val
            }
        });
        if (typeof val !== 'undefined') {
            listenToObjectOrArray(val, callback)
        }
    }

    export const createObjectPropertyListener = (obj: {}, property: string, callback: (val: any) => void) => {
        let callbacks = objectCallbacks.get(obj)
        const rootProperty = property.split('.').shift()
        if (!callbacks) {
            objectCallbacks.set(obj, callbacks = [])
        }
        callbacks.push({property, callback})
        const _callback = () => {
            const val = deepValue(obj, property);
            notifyListeners(obj, property, val)
        }
        notifyOnChange(obj, rootProperty, _callback)
    }

    const listenToObjectOrArray = (obj: any, callback: Callback) => {
        if (isObject(obj)) {
            Object.keys(obj).forEach(k => {
                if (!/parentWidget|childWidgets/.test(k) && !isFunction(obj[k])) {
                    notifyOnChange(obj, k, callback)
                }
            });
        } else if (Array.isArray(obj)) {
            observeArray(obj, {
                sort: () => callback(),
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
