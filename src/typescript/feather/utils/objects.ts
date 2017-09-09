module feather.objects {

    import TypedMap       = feather.types.TypedMap
    import observeArray   = feather.arrays.observeArray
    import ObjectChange   = feather.types.ObjectChange
    import Callback       = feather.types.Callback
    import isUndef        = feather.functions.isUndef

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
            if (isUndef(obj)) {
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
        if (isUndef(start)) {
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
        return a
    }

    export function collectAnnotationsFromTypeMap<T, P extends Object>(map: WeakMap<ObjectConstructor, TypedMap<T>>, start: P): TypedMap<T> {
        if (isUndef(start)) {
            return {}
        }
        const proto = Object.getPrototypeOf(start)
        const handlers = {...(map.get(proto)|| {})}
        if (proto) {
            merge(handlers, collectAnnotationsFromTypeMap(map, proto))
        }
        return handlers
    }

    export const pathCallbacks = new WeakMap<any, TypedMap<Array<ObjectChange>>>()

    const addPropertyListener = (obj: {}, root: {}, path: string, callback: Callback) => {
        const property = path.split('.').pop()
        let val = obj[property]
        Object.defineProperty(obj, property, {
            get: () => val,
            set: (newVal) => {
                val = newVal
                listenToObjectOrArray(val, root, path, callback)
                callback(path)
                return val
            }
        })
        listenToObjectOrArray(val, root, path, callback)
    }

    const pathKeys = (path: string, keys: string[]) => {
        const arrIndex = path.indexOf('.['),
              pathStr  = ~arrIndex  ? path.substring(0, arrIndex) : path
        return keys.filter(p => pathStr.startsWith(p) || p.startsWith(pathStr))
    }

    export const createObjectPropertyListener = (obj: {}, path: string, callback: ObjectChange) => {
        const isObserved = pathCallbacks.get(obj),
              property   = path.split('.').shift(),
              callbacks  = ensure(pathCallbacks, obj, {[path]: [callback]})
        if (!isObserved) {
            // we need to wait for all registrars before knowing what to listen to
            setTimeout(() =>
                addPropertyListener(obj, obj, property, (path: string) => {
                    pathKeys(path, Object.keys(callbacks)).forEach(pathKey => {
                        callbacks[pathKey].forEach(listener => {
                            listener(deepValue(obj, pathKey))
                        })
                    })
                })
            ,0)
        }
    }

    const listenToObjectOrArray = (obj: {}, root: {}, path, callback: Callback) => {
        if (isObject(obj)) {
            const rootListeners = Object.keys(pathCallbacks.get(root))
            Object.keys(obj).forEach(k => {
                const newPath = path + '.' + k
                if (pathKeys(newPath, rootListeners).length > 0) {
                    addPropertyListener(obj, root, newPath, callback)
                }
            })
        } else if (Array.isArray(obj)) {
            obj.forEach((i, idx) => listenToObjectOrArray(i, root, path + `.[${idx}]`, callback))
            observeArray(obj, {
                sort: () => callback(path),
                splice: (s, d, addedItems: any[]) => {
                    callback(path)
                    addedItems.forEach((i, idx) =>
                       listenToObjectOrArray(i, root, path + `.[${idx}]`, callback)
                    )
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
}
