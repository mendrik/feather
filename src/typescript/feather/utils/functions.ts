module feather.functions {

    export type FuncOne = (arg: any) => any

    export function compose<U>(fns: FuncOne[]): (any) => U {
        return function(res: any): U {
            for (let fn of fns) {
                res = fn(res)
            }
            return res as U
        }
    }

    export function isFunction(functionToCheck) {
        let getType = {}
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
    }

    let inheritedMethodCache = new WeakMap<any, string[]>()

    export function getInheritedMethods(obj: Object) {
        if (inheritedMethodCache.has(obj)) {
            return inheritedMethodCache.get(obj)
        }
        let props = [],
            orig = obj
        do {
            props = props.concat(Object.getOwnPropertyNames(obj))
        } while (obj = Object.getPrototypeOf(obj))

        let res = props.filter(p => isFunction(orig[p])) as string[]
        inheritedMethodCache.set(orig, res)
        return res;
    }

}
