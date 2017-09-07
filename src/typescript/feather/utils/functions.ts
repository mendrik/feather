module feather.functions {

    import FnOne         = feather.types.FnOne
    import StringFactory = feather.types.StringFactory

    const getType = {}.toString

    export const compose = <U>(fns: FnOne[]): any => (res: any): U =>
        fns.reduce((p, c) => c(p), res) as U

    export function isFunction(functionToCheck) {
        return functionToCheck && getType.call(functionToCheck) === '[object Function]'
    }

    export const isDef = (x) => typeof x !== 'undefined'
    export const isUndef = (x) => !isDef(x)

    export const strFactory = (x: StringFactory|string): string => isFunction(x) ? (x as any)() : x
}
