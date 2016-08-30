module feather.types {

    export type Maybe<T>    = T | void
    export type Primitive   = string|number|boolean|Array<SimpleMap>
    export type ValidRoot   = HTMLElement|HTMLDocument|DocumentFragment

    export type SimpleMap   = {[key: string]: any}
    export type TypedMap<T> = {[key: string]: T}
    export type HTML        = string

    export class Tuple<T, E> {
        constructor(public first: T, public second: E) {}
    }

}
