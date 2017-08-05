module feather.observe {

    import Widget              = feather.core.Widget
    import Hook                = feather.annotations.Hook
    import HookType            = feather.annotations.HookType
    import TypedMap            = feather.types.TypedMap
    import Primitive           = feather.types.Primitive
    import isObject            = feather.objects.isObject
    import observeArray        = feather.arrays.observeArray
    import ArrayListener       = feather.arrays.ArrayListener
    import from                = feather.arrays.from
    import insertBefore        = feather.dom.insertBefore
    import getInheritedMethods = feather.functions.getInheritedMethods
    import isFunction          = feather.functions.isFunction
    import FuncOne             = feather.functions.FuncOne
    import compose             = feather.functions.compose
    import RouteAware          = feather.routing.RouteAware
    import notifyListeners     = feather.arrays.notifyListeners
    import changeArrayListener = feather.arrays.changeArrayListener
    import format              = feather.strings.format
    import lis                 = feather.arrays.lis
    import diff                = feather.arrays.diff
    import patch               = feather.arrays.patch
    import removeFromArray     = feather.arrays.removeFromArray
    import collectAnnotationsFromTypeMap = feather.objects.collectAnnotationsFromTypeMap;

    const boundProperties = new WeakMap<Widget, TypedMap<Function[]>>()
    const binders = new WeakMap<Observable, TypedMap<BindProperties>>()
    const serializers = new WeakMap<Observable, TypedMap<Serializer>>()
    const attributeMapper = {} as Map<string, string>

    export interface BindProperties {
        templateName?: string   // when pushing new widgets into an array, the template name to render the children with
        changeOn?: string[] // list of property names
        localStorage?: boolean
        html?: boolean
    }

    function setOrRemoveAttribute(el: HTMLElement, attribute: string, condition: boolean, val: string) {
        if (condition) {
            el.setAttribute(attribute, val)
        } else {
            el.removeAttribute(attribute)
        }
    }

    function triggerParentArray(obj: Widget) {
        if (obj.parentWidget) {
            const parent = obj.parentWidget as any
            for (const key of Object.keys(parent)) {
                notifyListeners(parent[key])
            }
        }
    }

    const getWidgetId = (w: any) => {
        const name = w.id || w.name || w.title || w.constructor.name
        return isFunction(name) ? name() : name
    }

    const getPath = (obj: Widget, property: string) => {
        const segments = [property]
        let parent = obj
        do {
            segments.unshift(getWidgetId(parent))
        } while (parent = parent.parentWidget as Widget)
        return segments.join('.')
    }

    function destroyListeners(...obj: Widget[]) {
        obj.forEach(w => {
            w.cleanUp()
            boundProperties.delete(w)
        })
    }

    function maybeStore(parent: Observable, property: string, conf: BindProperties, value: any) {
        if (conf && conf.localStorage) {
            if (Array.isArray(value)) {
                const serializer = collectAnnotationsFromTypeMap(serializers, parent)[property] as Serializer
                value = value.map(parent[serializer.write])
            }
            localStorage.setItem(getPath(parent as any, property), JSON.stringify({value}))
        }
    }

    function createListener(obj: Widget, conf: BindProperties, property: string, cb: (newVal?: Primitive, oldVal?: Primitive) => void) {
        let value = obj[property]

        if (Array.isArray(value)) { // arrays are special case so we sort of fake getters and setters
            observeArray(value, changeArrayListener(() => {
                cb(value)
                triggerParentArray(obj)
                maybeStore(obj, property, conf, value)
            }))
        } else {
            let listeners = boundProperties.get(obj)
            if (!listeners) {
                boundProperties.set(obj, listeners = {
                    [property]: []
                })
            } else if (!listeners[property]) {
                listeners[property] = []
            }
            Object.defineProperty(obj, property, {
                get: function () {
                    return value
                },
                set: (newValue: any) => {
                    if (newValue !== value) {
                        maybeStore(obj, property, conf, value)
                        const old = value
                        value = newValue
                        for (const cb of listeners[property]) {
                            cb(newValue, old)
                        }
                        triggerParentArray(obj)
                    }
                    return newValue
                }
            })
            listeners[property].push(cb)
        }
    }

    function bindBoolean(property: string, hook: Hook, filter: FuncOne, conf: BindProperties) {
        if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) {

            const el = (hook.node as HTMLElement),
                attributeName = hook.text || property

            if (!hook.text) {
                el.removeAttribute(`{{${hook.curly}}}`)
            } else {
                el.setAttribute(hook.text, '')
            }

            createListener(this, conf, property, function updateDom(val) {
                if (typeof el[attributeName] === 'boolean') {
                    el[attributeName] = !!filter(val)
                } else {
                    setOrRemoveAttribute(el, attributeName, !!filter(val), '')
                }
                return updateDom
            }(this[property]))

        } else {
            throw Error('Bool value can only be bound to attributes ie. hidden="{{myBool}}. ' +
                'Consider using filters to convert them to strings (true|false|yes|no etc)"')
        }
    }

    function bindString(property: string, hook: Hook, filter: FuncOne, conf: BindProperties) {
        const widget = this,
            el = hook.node as HTMLElement

        if (hook.type === HookType.TEXT) { // <p>some text {{myVar}} goes here</p>
            createListener(this, conf, property, function updateDom() {
                const formatted = format(hook.text, widget, widget);
                if (conf.html) {
                    el.parentElement.innerHTML = formatted
                } else {
                    el.textContent = formatted
                }
                return updateDom
            }())
        } else if (hook.type === HookType.CLASS) { // <p class="red {{myVar}}">text goes here</p>
            createListener(this, conf, property, function updateDom(val, old?) {
                if (typeof old !== 'undefined') {
                    const fOld = filter(old)
                    if (fOld) {
                        el.classList.remove(fOld)
                    }
                }
                if (typeof val !== 'undefined') {
                    const fVal = filter(val)
                    if (fVal) {
                        el.classList.add(fVal)
                    }
                }
                return updateDom
            }(this[property]))
            el.classList.remove(`{{${hook.curly}}}`)
        } else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) { // <p style="{{myvar}}" {{hidden}}>text goes here</p>
            const attribName = hook.text || property

            createListener(this, conf, property, function updateDom(val) {
                const formatted = filter(val)
                setOrRemoveAttribute(el, attribName, typeof formatted !== 'undefined', formatted)
                return updateDom
            }(this[property]))

            if (!hook.text) {
                el.removeAttribute(`{{${hook.curly}}}`)
            }
        }
    }

    function defaultArrayListener(hook: Hook, conf: BindProperties, widget: Widget): ArrayListener<Widget> {
        const el = hook.node as HTMLElement
        return {
            sort(indices: any[]) {
                const children = from<HTMLElement>(el.children)
                indices.forEach(i => el.appendChild(children[i]))
            },
            splice(index: number, deleteCount: number, added: any[], deleted: any[] = []) {
                if (index === 0 && deleteCount === 0 && added.length === 0) {
                    return
                }
                from<HTMLElement>(el.children)
                    .slice(index, index + deleteCount)
                    .forEach(del => el.removeChild(del))

                const childWidgets = widget.childWidgets

                feather.arrays.removeFromArray(childWidgets, deleted)
                destroyListeners(...deleted)

                if (added && added.length) {
                    const frag = document.createDocumentFragment()
                    for (const item of added) {
                        item.parentWidget = widget
                        item.appendTemplateRoot(frag, conf.templateName)
                    }
                    childWidgets.push(...added)
                    insertBefore(el, frag, el.children[index])
                }
            }
        }
    }

    function bindArray(arr: Widget[], hook: Hook, conf: BindProperties) {
        const removed = arr.splice(0, arr.length),
            el = hook.node as HTMLElement
        observeArray(arr, defaultArrayListener(hook, conf, this))
        el.removeAttribute(`{{${hook.curly}}}`)
        arr.push(...removed)
    }

    function createObserver(property: string, value: Primitive, hook: Hook, conf: BindProperties, filter: FuncOne) {
        let typeOfValue
        if (typeof value === 'undefined') {
            typeOfValue = 'string' // it's the only possibility that makes sense here
        } else {
            typeOfValue = (Array.isArray(value) ? 'array' : typeof value).toLowerCase()
        }
        if (/boolean/.test(typeOfValue)) {
            bindBoolean.call(this, property, hook, filter, conf)
        } else if (/string|number/.test(typeOfValue)) {
            bindString.call(this, property, hook, filter, conf)
        } else if (/array/.test(typeOfValue)) {
            bindArray.call(this, this[property], hook, conf)
        } else {
            console.log('Bindings are only supported on arrays, booleans, strings and numbers')
        }
    }

    function createFilteredArrayProxy(property: string, hook: Hook, conf: BindProperties,
                                      filterFactory: () => (widget: Widget) => boolean) {
        const parentWidget = this as Widget,
            proxy: Widget[] = [],
            original: Widget[] = this[property],
            parent = hook.node as HTMLElement,
            syncProxy = () => {

                const target = original.filter(filterFactory()),
                    p = patch(target, proxy)
                let outOfPlace, place, proxyIndices, needSorting, addLength
                // let's remove excess elements from UI and proxy array
                if (p.remove.length) {
                    removeFromArray(proxy, p.remove)
                    p.remove.forEach(w => {
                        parent.removeChild(w.element)
                    })
                }
                addLength = p.add.length
                if (addLength) {
                    const doc = addLength !== 1 ? document.createDocumentFragment() : parent
                    p.add.forEach(w => {
                        w.parentWidget = parentWidget
                        w.appendTemplateRoot(doc, conf.templateName)
                    })
                    parentWidget.childWidgets.push(...p.add)
                    // let's add missing elements to UI and array in one go to the end of the list
                    if (addLength !== 1) {
                        parent.appendChild(doc)
                    }
                    proxy.push(...p.add)
                }
                // now let's check if some of the elements need repositioning
                proxyIndices = proxy.map(x => target.indexOf(x))
                needSorting = diff(proxyIndices, lis(proxyIndices)).sort((a, b) => b - a)
                for (let i = 0, n = needSorting.length; i < n; i++) {
                    outOfPlace = target[needSorting[i]]
                    place = target[needSorting[i] + 1]
                    parent.insertBefore(outOfPlace.element, place ? place.element : null)
                }
                proxy.splice(0, proxy.length, ...target)
            }
        syncProxy()
        observeArray(original, {
            sort: syncProxy,
            splice: (i, d, a, deleted: Widget[] = []) => {
                destroyListeners(...deleted)
                syncProxy()
            }
        })
        for (const prop of conf.changeOn) {
            createListener(this, conf, prop, () => notifyListeners(original))
        }
        parent.removeAttribute(`{{${hook.curly}}}`)
    }

    export class Observable extends RouteAware {

        protected attachHooks(hooks: Hook[]) {
            for (const hook of hooks) {

                const filterFunctions = hook.curly.split(/:/),
                    property = this.findProperty(filterFunctions.shift()),
                    conf = (collectAnnotationsFromTypeMap(binders, this) as TypedMap<BindProperties>)[property]
                let value = this[property]
                let storedValue;
                if (conf && conf.localStorage) {
                    try {
                        const json = localStorage.getItem(getPath(this as any, property));
                        if (json) {
                            storedValue = JSON.parse(json).value
                        }
                    } catch (e) {
                        console.warn(e)
                    }
                    if (typeof storedValue !== 'undefined' && !Array.isArray(storedValue)) {
                        this[property] = value = storedValue
                    }
                }
                const fm: (s) => string = this.findMethod.bind(this),
                    filter = compose<any>(filterFunctions
                        .map(fm)
                        .map(method => this[method].bind(this)))

                if (typeof conf === 'undefined') {
                    console.log(`@Bind() ${property} annotation missing?`, hook, property, value, binders)
                    continue
                }
                if (isObject(value)) {
                    console.log('Binding to objects is not supported. Use new widgets.')
                    continue
                } else if (isFunction(value)) {
                    console.log('Binding to functions is not supported. Use new filters.')
                    continue
                }
                value = filter(value)

                if (Array.isArray(this[property]) && isFunction(value)) {
                    // special case: we need to create an array proxy
                    createFilteredArrayProxy.call(this, property, hook, conf, filter)
                    if (storedValue) {
                        const serializer = collectAnnotationsFromTypeMap(serializers, this)[property] as Serializer
                        this[property].push(...storedValue.map(this[serializer.read]))
                    }
                } else {
                    createObserver.call(this, property, value, hook, conf, filter)
                }
            }
        }

        // attributes are case insensitive, so let's try to find the matching property like this
        findProperty(ci: string): string {
            let prop = attributeMapper[ci]
            if (!prop) {
                prop = Object.getOwnPropertyNames(this)
                    .find(p => p.toLowerCase() === ci.toLowerCase()) || ci
                attributeMapper[ci] = prop
            }
            return prop
        }

        findMethod(ci: string): string {
            let prop = attributeMapper[ci]
            if (!prop) {
                prop = getInheritedMethods(this)
                    .find(p => p.toLowerCase() === ci.toLowerCase()) || ci
                attributeMapper[ci] = prop
            }
            if (!this[prop]) {
                throw Error(`Couldn't find method '${ci}'`);
            }
            return prop
        }
    }

    export const Bind = (props?: BindProperties) => (proto: Observable, property: string) => {
        const defProps: BindProperties = {templateName: 'default', localStorage: false, changeOn: [], html: false},
            finalProps = props ? {...defProps, ...props} : {...defProps},
            protoBinders = binders.get(proto)

        if (!protoBinders) {
            binders.set(proto, {
                [property]: finalProps
            })
        } else {
            protoBinders[property] = finalProps
        }
    }

    interface Serializer {
        write?: string,
        read?: string
    }

    const ensure = (proto: Observable, property): Serializer => {
        let map = serializers.get(proto)
        if (!map) {
            serializers.set(proto, map = {})
        }
        if (!map[property]) {
            map[property] = {}
        }
        return map[property]
    }

    export const Write = (arrayName: string) => (proto, property: string) => {
        ensure(proto, arrayName).write = property
    }
    export const Read = (arrayName: string) => (proto, property: string) => {
        ensure(proto, arrayName).read = property
    }
}
