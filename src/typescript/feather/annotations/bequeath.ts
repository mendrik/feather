module feather.bequeath {

    import ensure          = feather.objects.ensure
    import TypedMap        = feather.types.TypedMap
    import collect         = feather.objects.collectAnnotationsFromArray

    const bequeaths        = new WeakMap<BequeathAware, TypedMap<Function>>()
    const bequeathsConfig  = new WeakMap<any, string[]>()

    export abstract class BequeathAware {

        initBequeath() {
            collect(bequeathsConfig, this).forEach(method => {
                ensure(bequeaths, this, {[method]: this[method].bind(this)})
            })
        }

        getBequeathMethod = (method: string) =>
            bequeaths.has(this) ? bequeaths.get(this)[method] : undefined

        cleanUp() {
            bequeaths.delete(this)
        }
    }

    export const Bequeath = () => (proto: any, method: string) => {
        ensure(bequeathsConfig, proto, [method])
    }
}
