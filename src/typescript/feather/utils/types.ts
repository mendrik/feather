module feather.types {

    export type Primitive = string | number | boolean | Array<SimpleMap>
    export type ValidRoot = HTMLElement | HTMLDocument | DocumentFragment

    export type SimpleMap = { [key: string]: any }
    export type TypedMap<T> = { [key: string]: T }
    export type HTML = string

}
