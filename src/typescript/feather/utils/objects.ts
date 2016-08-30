module feather.objects {

    import TypedMap = feather.types.TypedMap

    export function isObject(obj: any): boolean {
        return (obj !== null && typeof(obj) === 'object' && Object.prototype.toString.call(obj) === '[object Object]');
    }

    export function values<T>(data: TypedMap<T>): T[] {
        if ('values' in Object) {
            return Object['values'](data)
        } else {
            return Array.apply(null, Object.keys(data).map(o => data[o]))
        }
    }


    export function deepValue(obj ,path) {
        let i, len
        for (i = 0, path = path.split('.'), len = path.length; i < len; i++) {
            obj = obj[path[i]]
            if (typeof obj === 'undefined') {
                return
            }
        }
        return obj
    }
}
