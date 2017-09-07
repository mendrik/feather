module feather.observe {

    import Widget              = feather.core.Widget
    import format              = feather.strings.format
    import RouteAware          = feather.routing.RouteAware
    import Hook                = feather.annotations.Hook
    import HookType            = feather.annotations.HookType
    import TypedMap            = feather.types.TypedMap
    import FnOne               = feather.types.FnOne
    import Primitive           = feather.types.Primitive
    import OldNewCallback      = feather.types.OldNewCallback
    import observeArray        = feather.arrays.observeArray
    import ArrayListener       = feather.arrays.ArrayListener
    import from                = feather.arrays.from
    import notifyListeners     = feather.arrays.notifyListeners
    import removeFromArray     = feather.arrays.removeFromArray
    import isFunction          = feather.functions.isFunction
    import compose             = feather.functions.compose
    import isDef               = feather.functions.isDef
    import isUndef             = feather.functions.isUndef
    import isObject            = feather.objects.isObject
    import deepValue           = feather.objects.deepValue
    import ensure              = feather.objects.ensure
    import collect             = feather.objects.collectAnnotationsFromTypeMap
    import observe             = feather.objects.createObjectPropertyListener
    import Subscribable        = feather.hub.Subscribable

    const boundProperties      = new WeakMap<Subscribable, TypedMap<Function[]>>()
    const binders              = new WeakMap<Observable, TypedMap<BindProperties>>()
    const serializers          = new WeakMap<Observable, TypedMap<Serializer>>()
    const parentArrays         = new WeakMap<Subscribable, Subscribable[]>()
    const storeQueue           = new WeakMap<any, any>()
    const triggerQueue         = new WeakMap<any, any>()

    export interface BindProperties {
        templateName?: string   // when pushing new widgets into an array, the template name to render the children with
        changeOn?:     string[] // list of property names that trigger an array update
        localStorage?: boolean  // initialize values from local storage
        bequeath?:     boolean  // child widget can bind this in their own templates
        html?:         boolean  // string contains html, do not bind to template root. experimental.
    }

    const setOrRemoveAttribute = (el: Element, attribute: string, condition: boolean, val: string) => {
        if (attribute === 'value') {
            (el as HTMLInputElement).value = condition ? val : '';
        } else if (condition) {
            el.setAttribute(attribute, val)
        } else {
            el.removeAttribute(attribute)
        }
    }

    const setParentArray = (arr: any[], widgets: Subscribable[]) => {
        for (const w of widgets) {
            parentArrays.set(w, arr)
            if (w.childWidgets) {
                setParentArray(arr, w.childWidgets)
            }
        }
    }

    const triggerParentArray = (obj: Observable) => {
        const parentArray = parentArrays.get(obj)
        if (parentArray) {
            if (triggerQueue.has(parentArray)) {
                clearTimeout(triggerQueue.get(parentArray))
            }
            triggerQueue.set(parentArray,
                setTimeout(() =>
                    notifyListeners(parentArray), 5))
        }
    }

    const getWidgetId = (w: any) => {
        const name = w.id || w.name || w.title || w.constructor.name
        return isFunction(name) ? name() : name
    }

    const getPath = (obj: Subscribable, property: string) => {
        const segments = [property]
        let parent = obj
        do {
            segments.unshift(getWidgetId(parent))
        } while (parent = parent.parentWidget)
        return segments.join('.')
    }

    const destroyListeners = (widgets: Subscribable[]) => {
        for (const w of widgets) {
            w.cleanUp()
        }
    }

    const store = (parent, property, value) =>
        localStorage.setItem(getPath(parent, property), JSON.stringify({value}))

    const maybeStore = (parent: Observable, property: string, conf: BindProperties, value: any, isArray: boolean) => {
        if (conf && conf.localStorage) {
            if (isArray) {
                if (storeQueue.has(value)) {
                    clearTimeout(storeQueue.get(value))
                }
                storeQueue.set(value, setTimeout(() => {
                    const serializer = collect(serializers, parent)[property]
                    value = value.map(parent[serializer.write])
                    store(parent, property, value)
                }, 50))
            } else {
                store(parent, property, value)
            }
        }
    }

    function createListener(obj: Widget,
                            conf: BindProperties,
                            property: string,
                            cb: OldNewCallback<Primitive>) {
        let value = obj[property]

        // arrays are special case so we sort of fake getters and setters
        if (Array.isArray(value)) {
            // this is for arrays transformed to strings or booleans
            const proxyCallback = () => {
                cb(value)
                maybeStore(obj, property, conf, value, true)
            }
            observeArray(value, {
                sort: proxyCallback,
                splice: proxyCallback
            })
        } else {
            const listeners = ensure(boundProperties, obj, {[property]: [cb]})
            Object.defineProperty(obj, property, {
                get: () => value,
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
        }
    }

    function bindBoolean(value: any,
                         hook: Hook,
                         transform: FnOne,
                         conf: BindProperties,
                         createListener: Function) {
        if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) {

            const el = (hook.node as HTMLElement),
                  attributeName = hook.attribute || hook.property,
                  updateDom = (val) => {
                      if (typeof el[attributeName] === 'boolean') {
                          el[attributeName] = !!transform(val)
                      } else {
                          setOrRemoveAttribute(el, attributeName, !!transform(val), '')
                      }
                      return updateDom
                  }
            createListener(this, conf, hook.property, updateDom(value))
        } else {
            throw Error('Bool value can only be bound to attributes ie. hidden="{{myBool}}. ' +
                'Consider using filters to convert them to strings (true|false|yes|no etc)"')
        }
    }

    function bindStringOrNumber(value: string|number,
                                hook: Hook,
                                transform: FnOne,
                                conf: BindProperties,
                                createListener: Function) {
        const widget = this,
              el     = hook.node

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
            createListener(this, conf, hook.property, updateDom())
        } else if (hook.type === HookType.CLASS) { // <p class="red {{myVar}}">text goes here</p>
            const classList = (val: any, fn: Function) => {
                if (isDef(val)) {
                    const nVal = transform(val)
                    nVal && fn(nVal)
                }
            }
            const updateDom = (val: any, old?: any) => {
                classList(old, (v) => el.classList.remove(v))
                classList(val, (v) => el.classList.add(v))
                return updateDom
            }
            createListener(this, conf, hook.property, updateDom(value))
        } else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) { // <p style="{{myvar}}" {{hidden}}>text goes here</p>
            const attributeName = hook.attribute || hook.property,
                  updateDom = (val) => {
                      const formatted: string = transform(val)
                      setOrRemoveAttribute(el, attributeName, isDef(formatted), formatted)
                      return updateDom
                  }
            createListener(this, conf, hook.property, updateDom(value))
        }
    }

    function defaultArrayListener(widget: Widget,
                                  arr: Widget[],
                                  hook: Hook,
                                  conf: BindProperties,
                                  filterFactory: Function): ArrayListener<Widget> {
        const el = hook.node,
              firstChild = el.firstElementChild // usually null
        let nodeVisible: boolean[] = []
        return {
            sort(indices: any[]) {
                const copy: boolean[] = []
                for (let i = 0; i < indices.length; i++) {
                    if (nodeVisible[indices[i]]) {
                        el.appendChild(arr[i].element)
                    }
                    copy[i] = nodeVisible[indices[i]]
                }
                nodeVisible = copy
            },
            splice(index: number, deleteCount: number, added: Widget[], deleted: Widget[] = []) {
                const patch = from<boolean>(nodeVisible),
                      childWidgets = widget.childWidgets,
                      filter = filterFactory()
                // handle deleted items
                nodeVisible.splice(index, deleteCount, ...added.map(v => false));

                if (deleteCount > 0) {
                    deleted.forEach(del => el.removeChild(del.element))
                    removeFromArray(childWidgets, deleted)
                    destroyListeners(deleted)
                }
                if (added.length) {
                    childWidgets.push(...added)
                    for (const item of added) {
                        item.parentWidget = widget
                        if (!item.element) {
                            const parsed = item.getParsed(conf.templateName)
                            item.bindToElement(parsed.first)
                        }
                    }
                    setParentArray(arr, added)
                }
                patch.splice(index, deleteCount, ...added.map(v => true))
                for (let i = 0, n = arr.length; i < n; i++) {
                    patch[i] = filter(arr[i])
                    if (patch[i] && !nodeVisible[i]) {
                        const nextVisible = nodeVisible.indexOf(true, i),
                              refNode     = ~nextVisible ? arr[nextVisible].element : firstChild
                        el.insertBefore(arr[i].element, refNode)
                    }
                    else if (!patch[i] && nodeVisible[i]) {
                        el.removeChild(arr[i].element)
                    }
                }
                nodeVisible = patch
            }
        }
    }

    function bindArray(arr: Widget[], hook: Hook, conf: BindProperties, transform: Function) {
        const el = hook.node,
              removed = arr.splice(0, arr.length)
        observeArray(arr, defaultArrayListener(this, arr, hook, conf, transform))
        arr.push(...removed)
        for (const prop of conf.changeOn) {
            createListener(this, conf, prop, () => notifyListeners(arr))
        }
    }

    function createDeepObserver(path: string, hook: Hook, transform: FnOne) {
        const dummyCreate = (newVal) => (a, b, c, callback) => dummyCreate,
              rootProperty = path.split('.').shift(),
              initialValue = deepValue(this, path),
              typeOfValue = (typeof transform(initialValue)).toLowerCase(),
              conf = collect(binders, this)[rootProperty],
              update = (val) => {
                  if (/boolean/.test(typeOfValue)) {
                      bindBoolean.call(this, val, hook, transform, conf, dummyCreate)
                  } else if (/string|number|undefined/.test(typeOfValue)) {
                      bindStringOrNumber.call(this, val, hook, transform, conf, dummyCreate)
                  } else {
                      console.log(
                          'Deeply bound properties work only with strings, numbers or booleans. ' +
                          'For arrays you can use a transformer: {{var:myTransformer}}?'
                      )
                  }
                  return update
              }
        observe(this, path, update(initialValue))
    }

    const identity = (el) => () => true

    function createObserver(transformedValue: Primitive|Function, hook: Hook, conf: BindProperties, transform: Function) {
        const typeOfValue = Array.isArray(transformedValue) ? 'array' : (typeof transformedValue).toLowerCase(),
              initialValue = this[hook.property]
        if (/boolean/.test(typeOfValue)) {
            bindBoolean.call(this, initialValue, hook, transform, conf, createListener)
        } else if (/string|number|undefined/.test(typeOfValue)) {
            bindStringOrNumber.call(this, initialValue, hook, transform, conf, createListener)
        } else if (/array/.test(typeOfValue) || isFunction(transformedValue)) {
            if (!isFunction(transformedValue)) {
                transform = identity
            }
            bindArray.call(this, initialValue, hook, conf, transform)
        } else {
            console.log('Bindings are only supported on arrays, booleans, strings and numbers')
        }
    }

    function tryToBindFromParentWidget(current: Observable, context: Observable, hook: Hook, property: string) {
        property = property.split('.').shift()
        if (!current) {
            console.log(`@Bind() ${property} annotation missing or 'bequeath' not set?`, hook, property, binders)
            return
        }
        const conf = collect(binders, current)[property]
        if (conf && conf.bequeath) {
            current.attachHooks.call(current, [hook], context)
        } else {
            tryToBindFromParentWidget(current.parentWidget as Widget, context, hook, property)
        }
    }

    const loadLocalStorageValue = (context: Observable) => {
        const boundProperties = collect(binders, context)
        if (boundProperties) {
            Object.keys(boundProperties).forEach(property => {
                if (boundProperties[property].localStorage) {
                    try {
                        const json = localStorage.getItem(getPath(context, property))
                        if (json) {
                            const storedValue = JSON.parse(json).value
                            if (Array.isArray(storedValue)) {
                                const serializer = collect(serializers, context)[property]
                                context[property] = storedValue.map(context[serializer.read])
                            } else {
                                context[property] = storedValue
                            }
                        }
                    } catch (e) {
                        console.warn(e)
                    }
                }
            })
        }
    }

    export class Observable extends RouteAware {

        attachHooks(hooks: Hook[], parent?: any) {
            const context: Widget = parent || this
            if (isUndef(parent)) {
                loadLocalStorageValue(this)
            }
            for (const hook of hooks) {
                const property     = hook.property,
                      conf         = collect(binders, this)[property],
                      transform    = compose<any>(hook.transformFns
                                        .map(method =>
                                            context[method].bind(context)))

                let value = this[property]

                if (~property.indexOf('.') || isObject(value) && hook.hasMethods()) {
                    value = deepValue(this, property)
                    if (isUndef(value)) {
                        tryToBindFromParentWidget(this.parentWidget as Observable, this, hook, property)
                    } else {
                        createDeepObserver.call(this, property, hook, transform)
                    }
                    continue
                } else if (isObject(value) && !hook.hasMethods()) {
                    console.log('Binding to objects is not supported. Use new widgets or specify inner property: x.y.z')
                    continue
                } else if (isFunction(value)) {
                    console.log('Binding to functions is not supported. Use new filters.')
                    continue
                }
                if (isUndef(conf)) {
                    tryToBindFromParentWidget(this.parentWidget as Observable, this, hook, property)
                    continue
                }
                createObserver.call(this, transform(value), hook, conf, transform)
            }
        }

        cleanUp() {
            super.cleanUp();
            boundProperties.delete(this)
            parentArrays.delete(this)
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
