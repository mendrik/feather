module feather.routing {

    import TypedMap        = feather.types.TypedMap
    import Widget          = feather.core.Widget
    import Subscribable    = feather.hub.Subscribable
    import namedRegexMatch = feather.strings.namedRegexMatch
    import collect         = feather.objects.collectAnnotationsFromArray
    import ensure          = feather.objects.ensure

    interface RouteConfig {
        route:   string,
        handler: string
    }

    const routes      = new WeakMap<RouteAware, RouteConfig[]>()
    const routeAwares = [] as RouteAware[] // memory leaks here?
    const namedRx     = /[:*]\w+/gi
    const historyAPI  = (window.history && window.history.pushState) && document.querySelector('[routing="hash"]') === null
    const rules = [
        [/:\w+/gi, '([\\w\\d-]+)'],
        [/\*\w+/gi, '(.+)']
    ]

    // supports :param and *param and optional parts ()
    export const namedMatch = (pattern: string, input: string): TypedMap<string> => {
        let names = pattern.match(namedRx)
        if (names && names.length) {
            names = names.map(str => str.substr(1))
            const repl = rules.reduce((p, c: [RegExp, string]) => p.replace(c[0], c[1]), pattern),
                  finalR = new RegExp('^' + repl + '$', 'gi')
            return namedRegexMatch(input, finalR, names)
        } else {
            if (new RegExp('^' + pattern + '$', 'gi').exec(input)) {
                return {}
            }
        }
    }

    const getCurrentRoute = () => {
        let path = location.pathname
        if (!historyAPI) {
            if (path !== '/') {
                location.replace('/#' + path)
            } else {
                path = !location.hash ? '/' : location.hash.replace(/^#/, '')
            }
        }
        return path
    }

    const notifyListeners = (route: string) => {
        for (const aware of routeAwares) {
            const widgetRoutes = collect(routes, aware)
            for (const rc of widgetRoutes) {
                const matchedParams = namedMatch(rc.route, route)
                if (matchedParams) {
                    aware[rc.handler].call(aware, matchedParams)
                }
            }
        }
    }

    window.addEventListener(historyAPI ? 'popstate' : 'hashchange', () => notifyListeners(getCurrentRoute()), false)

    const navigateRoute = (path: string) => {
        if (historyAPI) {
            history.pushState(null, '', path)
            notifyListeners(getCurrentRoute())
        } else {
            location.hash = path
        }
    }

    export abstract class RouteAware extends Subscribable {

        currentRoute = getCurrentRoute

        initRoutes() {
            if (!~routeAwares.indexOf(this) && routes.has(Object.getPrototypeOf(this))) {
                routeAwares.push(this)
            }
        }

        route = (path: string) => navigateRoute(path)
    }

    export const runRoutes = () => {
        if (!window['blockRouting']) {
            notifyListeners(getCurrentRoute())
        }
    }

    export const Route = (route: string) => (proto: Widget, method: string) => {
        const s = ensure(routes, proto, [])
        s.push({
            route: route,
            handler: method
        } as RouteConfig)
    }
}
