module feather.types {

    export type Primitive = string | number | boolean | Array<SimpleMap>
    export type ValidRoot = HTMLElement | HTMLDocument | DocumentFragment

    export type SimpleMap = { [key: string]: any }
    export type TypedMap<T> = { [key: string]: T }
    export type HTML = string

    export type TypeOrArray<T> = T[] | T
    export type ObjectChange = (val: any) => void
    export type Callback = () => void
    export type OldNewCallback<T> = (newVal?: T, oldVal?: T) => void

    export type Factory<T> = () => T
    export type FnOne = <A1, R>(arg: A1) => R

}
