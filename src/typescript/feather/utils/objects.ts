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

    export function deepValue(obj: {}, path: string, value?: any): any {
        let i, len, pathArr
        for (i = 0, pathArr = path.split('.'), len = value ? pathArr.length - 1 : pathArr.length; i < len; i++) {
            obj = obj[pathArr[i]]
            if (typeof obj === 'undefined') {
                return
            }
        }
        if (value) {
            obj[pathArr.pop()] = obj = value
        }
        return obj
    }
}
