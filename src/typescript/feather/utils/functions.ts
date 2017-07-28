module feather.functions {

    export type FuncOne = (arg: any) => any

    export function compose<U>(fns: FuncOne[]): (any) => U {
        return function(res: any): U {
            for (const fn of fns) {
                res = fn(res)
            }
            return res as U
        }
    }

    export function isFunction(functionToCheck) {
        const getType = {}
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]'
    }

    const inheritedMethodCache = new WeakMap<any, string[]>()

    export function getInheritedMethods(obj: Object): string[] {
        if (inheritedMethodCache.has(obj)) {
            return inheritedMethodCache.get(obj)
        }
        let props: string[] = []
        const orig = obj
        do {
            props = props.concat(Object.getOwnPropertyNames(obj))
        } while (obj = Object.getPrototypeOf(obj))

        const res = props.filter(p => isFunction(orig[p]))
        inheritedMethodCache.set(orig, res)
        return res;
    }

}
