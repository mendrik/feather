module feather.types {

    export type Primitive = string | number | boolean | Array<SimpleMap>
    export type ValidRoot = Element | DocumentFragment

    export type SimpleMap = { [key: string]: any }
    export type TypedMap<T> = { [key: string]: T }

    export type ObjectChange = (val: any) => void
    export type Callback = (path: string) => void
    export type OldNewCallback<T> = (newVal?: T, oldVal?: T) => void

    export type FnOne = <A1, R>(arg: A1) => R

    export type StringFactory = () => string
}
