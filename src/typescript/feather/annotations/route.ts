module feather.routing {

    import TypedMap        = feather.types.TypedMap
    import Widget          = feather.core.Widget
    import Subscribable    = feather.hub.Subscribable
    import namedRegexMatch = feather.strings.namedRegexMatch
    import collectAnnotationsFromArray = feather.objects.collectAnnotationsFromArray

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
            let repl = rules.reduce((p, c: [RegExp, string]) => p.replace(c[0], c[1]), pattern),
                finalR = new RegExp('^' + repl + '$', 'gi')
            return namedRegexMatch(input, finalR, names)
        } else {
            if (new RegExp('^' + pattern + '$', 'gi').exec(input)) {
                return {}
            }
        }
    }

    let getCurrentRoute = () => {
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

    let notifyListeners = (route: string) => {
        for (let aware of routeAwares) {
            let widgetRoutes = collectAnnotationsFromArray(routes, aware)
            for (let rc of widgetRoutes) {
                let matchedParams = namedMatch(rc.route, route)
                if (matchedParams) {
                    aware[rc.handler].call(aware, matchedParams)
                }
            }
        }
    }

    window.addEventListener(historyAPI ? 'popstate' : 'hashchange', () => notifyListeners(getCurrentRoute()), false)

    let navigateRoute = (path: string) => {
        if (historyAPI) {
            history.pushState(null, '', path)
            notifyListeners(getCurrentRoute())
        } else {
            location.hash = path
        }
    }

    export abstract class RouteAware extends Subscribable {

        initRoutes() {
            if (!~routeAwares.indexOf(this) && routes.has(Object.getPrototypeOf(this))) {
                routeAwares.push(this)
            }
        }

        currentRoute = getCurrentRoute

        route = (path: string) => navigateRoute(path)
    }

    export let runRoutes = () => {
        if (!window['blockRouting']) {
            notifyListeners(getCurrentRoute())
        }
    }

    export let Route = (route: string) => (proto: Widget, method: string) => {
        let s = routes.get(proto)
        if (!s) {
            routes.set(proto, s = [])
        }
        s.push({
            route: route,
            handler: method
        } as RouteConfig)
    }
}
