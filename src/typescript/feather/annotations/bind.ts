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
    import compose             = feather.functions.compose
    import RouteAware          = feather.routing.RouteAware
    import notifyListeners     = feather.arrays.notifyListeners
    import changeArrayListener = feather.arrays.changeArrayListener
    import format              = feather.strings.format
    import lis                 = feather.arrays.lis
    import diff                = feather.arrays.diff
    import patch               = feather.arrays.patch
    import removeFromArray     = feather.arrays.removeFromArray
    import deepValue           = feather.objects.deepValue
    import ensure              = feather.objects.ensure
    import collect             = feather.objects.collectAnnotationsFromTypeMap
    import observe             = feather.objects.createObjectPropertyListener
    import getOrCreate         = feather.objects.getOrCreate
    import FnOne               = feather.types.FnOne

    const boundProperties      = new WeakMap<Observable, TypedMap<Function[]>>()
    const binders              = new WeakMap<Observable, TypedMap<BindProperties>>()
    const serializers          = new WeakMap<Observable, TypedMap<Serializer>>()
    const attributeMapper      = {} as Map<string, string>

    export interface BindProperties {
        templateName?: string   // when pushing new widgets into an array, the template name to render the children with
        changeOn?: string[]     // list of property names that trigger an array update
        localStorage?: boolean  // initialize values from local storage
        bequeath?: boolean      // child widget can bind this in their own templates
        html?: boolean          // string contains html, do not bind to template root. experimental.
    }

    const setOrRemoveAttribute = (el: HTMLElement, attribute: string, condition: boolean, val: string) => {
        if (condition) {
            el.setAttribute(attribute, val)
        } else {
            el.removeAttribute(attribute)
        }
    }

    const triggerParentArray = (obj: Observable) => {
        if (obj.parentWidget) {
            const parent = obj.parentWidget
            for (const key of Object.keys(parent)) {
                notifyListeners(parent[key])
            }
        }
    }

    const getWidgetId = (w: any) => {
        const name = w.id || w.name || w.title || w.constructor.name
        return isFunction(name) ? name() : name
    }

    const getPath = (obj: Observable, property: string) => {
        const segments = [property]
        let parent = obj
        do {
            segments.unshift(getWidgetId(parent))
        } while (parent = parent.parentWidget as Widget)
        return segments.join('.')
    }

    const destroyListeners = (...widgets: Observable[]) => {
        for (const w of widgets) {
            w.cleanUp()
            boundProperties.delete(w)
        }
    }

    const maybeStore = (parent: Observable, property: string, conf: BindProperties, value: any, isArray: boolean) => {
        if (conf && conf.localStorage) {
            if (isArray) {
                const serializer = collect(serializers, parent)[property] as Serializer
                value = value.map(parent[serializer.write])
            }
            localStorage.setItem(getPath(parent, property), JSON.stringify({value}))
        }
    }

    function createListener(obj: Widget, conf: BindProperties, property: string, cb: (newVal?: Primitive, oldVal?: Primitive) => void) {
        let value = obj[property]

        if (Array.isArray(value)) { // arrays are special case so we sort of fake getters and setters
            observeArray(value, changeArrayListener(() => {
                cb(value)
                triggerParentArray(obj)
                maybeStore(obj, property, conf, value, true)
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
                        maybeStore(obj, property, conf, newValue, false)
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

    function bindBoolean(property: string,
                         value: any,
                         hook: Hook,
                         transform: FnOne,
                         conf: BindProperties,
                         createListener: Function) {
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
                    el[attributeName] = !!transform(val)
                } else {
                    setOrRemoveAttribute(el, attributeName, !!transform(val), '')
                }
                return updateDom
            }(value))

        } else {
            throw Error('Bool value can only be bound to attributes ie. hidden="{{myBool}}. ' +
                'Consider using filters to convert them to strings (true|false|yes|no etc)"')
        }
    }

    function bindStringOrNumber(property: string,
                                value: string|number,
                                hook: Hook,
                                transform: FnOne,
                                conf: BindProperties,
                                createListener: Function) {
        const widget = this,
              el     = hook.node as HTMLElement

        if (hook.type === HookType.TEXT) { // <p>some text {{myVar}} goes here</p>
            const updateDom = () => {
                const formatted = format(hook.text, widget, widget)
                if (conf.html) {
                    el.parentElement.innerHTML = formatted
                } else {
                    el.textContent = formatted
                }
                return updateDom
            }
            createListener(this, conf, property, updateDom())
        } else if (hook.type === HookType.CLASS) { // <p class="red {{myVar}}">text goes here</p>
            const classList = (val: any, fn: Function) => {
                if (typeof val !== 'undefined') {
                    const nVal = transform(val)
                    nVal && fn(nVal)
                }
            }
            const updateDom = (val: any, old?: any) => {
                classList(old, (v) => el.classList.remove(v))
                classList(val, (v) => el.classList.add(v))
                return updateDom
            }
            createListener(this, conf, property, updateDom(value))
            el.classList.remove(`{{${hook.curly}}}`)
        } else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) { // <p style="{{myvar}}" {{hidden}}>text goes here</p>
            const attributeName = hook.text || property,
                  updateDom = (val) => {
                      const formatted: string = transform(val)
                      setOrRemoveAttribute(el, attributeName, typeof formatted !== 'undefined', formatted)
                      return updateDom
                  }
            createListener(this, conf, property, updateDom(value))
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
            splice(index: number, deleteCount: number, added: Widget[], deleted: Widget[] = []) {
                if (index === 0 && deleteCount === 0 && added.length === 0) {
                    return
                }
                from<HTMLElement>(el.children)
                    .slice(index, index + deleteCount)
                    .forEach(del => el.removeChild(del))

                const childWidgets = widget.childWidgets

                feather.arrays.removeFromArray(childWidgets, deleted)
                destroyListeners(...deleted)

                if (added.length) {
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
            el = hook.node
        observeArray(arr, defaultArrayListener(hook, conf, this))
        el.removeAttribute(`{{${hook.curly}}}`)
        arr.push(...removed)
    }

    function createDeepObserver(path: string, hook: Hook, transform: FnOne) {
        const dummyCreate = (newVal) => (a, b, c, callback) => dummyCreate,
              rootProperty = path.split('.').shift(),
              initialValue = deepValue(this, path),
              typeOfValue = (typeof transform(initialValue)).toLowerCase(),
              conf = (collect(binders, this) as TypedMap<BindProperties>)[rootProperty],
              update = (val) => {
                  if (/boolean/.test(typeOfValue)) {
                      bindBoolean.call(this, null, val, hook, transform, conf, dummyCreate)
                  } else if (/string|number|undefined/.test(typeOfValue)) {
                      bindStringOrNumber.call(this, null, val, hook, transform, conf, dummyCreate)
                  } else {
                      console.log('Deeply bound properties only work with primitive types ' +
                          '(string, number, boolean). For arrays you can use a transformer: ' +
                          '{{var:myTransformer}}?')
                  }
                  return update
              }
        observe(this, path, update(initialValue))
    }

    function createObserver(property: string, value: Primitive, hook: Hook, conf: BindProperties, transform: FnOne) {
        const typeOfValue = Array.isArray(value) ? 'array' : (typeof value).toLowerCase(),
              initialValue = this[property]
        if (/boolean/.test(typeOfValue)) {
            bindBoolean.call(this, property, initialValue, hook, transform, conf, createListener)
        } else if (/string|number|undefined/.test(typeOfValue)) {
            bindStringOrNumber.call(this, property, initialValue, hook, transform, conf, createListener)
        } else if (/array/.test(typeOfValue)) {
            bindArray.call(this, initialValue, hook, conf)
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

    function tryToBindFromParentWidget(current: Observable, context: Observable, hook: Hook, property: string) {
        property = property.split('.').shift()
        if (!current) {
            console.log(`@Bind() ${property} annotation missing or 'bequeath' not set?`, hook, property, binders)
            return
        }
        property = current.findProperty(property)
        const conf = (collect(binders, current) as TypedMap<BindProperties>)[property]
        if (conf && conf.bequeath) {
            current.attachHooks.call(current, [hook], context)
        } else {
            tryToBindFromParentWidget(current.parentWidget as Widget, context, hook, property)
        }
    }

    export class Observable extends RouteAware {

        attachHooks(hooks: Hook[], parent?: any) {
            const context: Widget = parent || this
            for (const hook of hooks) {

                const transformFns = hook.curly.split(/:/),
                      property     = this.findProperty(transformFns.shift()),
                      conf         = (collect(binders, this) as TypedMap<BindProperties>)[property]
                let   value        = this[property],
                      storedValue

                const fm: (s) => string = context.findMethod.bind(context),
                      transform  = compose<any>(transformFns
                                   .map(fm)
                                   .map(method => context[method].bind(context)))

                if (~property.indexOf('.')) {
                    value = deepValue(this, property)
                    if (typeof value === 'undefined') {
                        tryToBindFromParentWidget(this.parentWidget as Observable, this, hook, property)
                    } else {
                        createDeepObserver.call(this, property, hook, transform)
                    }
                    continue
                } else if (isObject(value)) {
                    console.log('Binding to objects is not supported. Use new widgets or specify inner property: x.y.z')
                    continue
                } else if (isFunction(value)) {
                    console.log('Binding to functions is not supported. Use new filters.')
                    continue
                }
                if (typeof conf === 'undefined') {
                    tryToBindFromParentWidget(this.parentWidget as Observable, this, hook, property)
                    continue
                } else if (!parent && conf.localStorage) {
                    try {
                        const json = localStorage.getItem(getPath(this, property))
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
                value = transform(value)

                const isArray = Array.isArray(this[property])
                // special case: we need to create an array proxy
                if (isArray && isFunction(value)) {
                    createFilteredArrayProxy.call(this, property, hook, conf, transform)
                } else {
                    createObserver.call(this, property, value, hook, conf, transform)
                }
                if (typeof storedValue !== 'undefined' && isArray) {
                    const serializer = collect(serializers, this)[property] as Serializer
                    this[property].push(...storedValue.map(this[serializer.read]))
                }
            }
        }

        // attributes are case insensitive, so let's try to find the matching property like this
        findProperty(ci: string): string {
            return getOrCreate(attributeMapper, ci, () =>
                Object.getOwnPropertyNames(this)
                    .find(p => p.toLowerCase() === ci.toLowerCase()) || ci
            )
        }

        findMethod(ci: string): string {
            return getOrCreate(attributeMapper, ci, () =>
                getInheritedMethods(this)
                    .find(p => p.toLowerCase() === ci.toLowerCase()) || ci
            )
        }
    }

    export const Bind = (props?: BindProperties) => (proto: Observable, property: string) => {
        const defProps: BindProperties = {templateName: 'default', localStorage: false, changeOn: [], html: false},
              finalProps               = props ? {...defProps, ...props} : {...defProps}
        ensure(binders, proto, {[property]: finalProps})
    }

    export interface Serializer {
        write?: string,
        read?: string
    }

    export const Write = (arrayName: string) => (proto: Observable, method: string) => {
        ensure(serializers, proto, {[arrayName]: {write: method}})
    }

    export const Read = (arrayName: string) => (proto: Observable, method: string) => {
        ensure(serializers, proto, {[arrayName]: {read: method}})
    }
}
