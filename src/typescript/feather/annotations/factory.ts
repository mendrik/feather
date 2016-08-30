module feather.annotations {

    import WidgetFactory = feather.boot.WidgetFactory
    import Blueprint = feather.boot.Blueprint

    export let Construct = (blueprint: Blueprint) => (target: any) => WidgetFactory.register(blueprint, target)
}
