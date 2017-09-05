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
               //     store(parent, property, value)
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
                splice: (i, dc, added, deleted) => {
                    setParentArray(value, added)
                    destroyListeners(deleted)
                    proxyCallback()
                }
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

    function bindBoolean(property: string,
                         value: any,
                         hook: Hook,
                         transform: FnOne,
                         conf: BindProperties,
                         createListener: Function) {
        if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) {

            const el = (hook.node as HTMLElement),
                  attributeName = hook.attribute || property,
                  updateDom = (val) => {
                      if (typeof el[attributeName] === 'boolean') {
                          el[attributeName] = !!transform(val)
                      } else {
                          setOrRemoveAttribute(el, attributeName, !!transform(val), '')
                      }
                      return updateDom
                  }

            if (!hook.attribute) {
                el.removeAttribute(`{{${hook.curly}}}`)
            } else {
                el.setAttribute(hook.attribute, '')
            }
            createListener(this, conf, property, updateDom(value))
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
            createListener(this, conf, property, updateDom())
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
            createListener(this, conf, property, updateDom(value))
            el.classList.remove(`{{${hook.curly}}}`)
        } else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) { // <p style="{{myvar}}" {{hidden}}>text goes here</p>
            const attributeName = hook.attribute || property,
                  updateDom = (val) => {
                      const formatted: string = transform(val)
                      setOrRemoveAttribute(el, attributeName, isDef(formatted), formatted)
                      return updateDom
                  }
            createListener(this, conf, property, updateDom(value))
            if (!hook.attribute) {
                el.removeAttribute(`{{${hook.curly}}}`)
            }
        }
    }

    interface ElementStatus {
        visible: boolean;
    }

    function defaultArrayListener(arr: Widget[], hook: Hook, conf: BindProperties, widget: Widget, filter: Function): ArrayListener<Widget> {
        const el = hook.node,
              nodeStatus: ElementStatus[] = arr.map(w => ({visible: false}))
        console.log(arr)
        return {
            sort(indices: any[]) {
                const children = from<HTMLElement>(el.children)
                for (const i of indices) {
                    el.appendChild(children[i])
                }
            },
            splice(index: number, deleteCount: number, added: Widget[], deleted: Widget[] = []) {
                if (index === 0 && deleteCount === 0 && added.length === 0) {
                    return
                }
                const patch = nodeStatus.map(ns => ({visible: ns.visible})),
                      childWidgets = widget.childWidgets
                for (let i = 0; i < deleteCount; i++) {
                    patch[i + index].visible = false
                }

                removeFromArray(childWidgets, deleted)
                destroyListeners(deleted)

                if (added.length) {
                    childWidgets.push(...added)
                    for (let i = 0; i < deleteCount; i++) {
                        const item = added[i];
                        item.parentWidget = widget
                        const parsed = item.getParsed(conf.templateName)
                        item.bindToElement(parsed.first)
                        patch[i + index + deleteCount].visible = true;
                    }
                    setParentArray(this, added)
                }

                console.log(nodeStatus, patch)
            }
        }
    }

    function bindArray(arr: Widget[], hook: Hook, conf: BindProperties, transform: Function) {
        const removed = arr.splice(0, arr.length),
              el = hook.node
        observeArray(arr, defaultArrayListener(arr, hook, conf, this, transform))
        el.removeAttribute(`{{${hook.curly}}}`)
        arr.push(...removed)
    }

    function createDeepObserver(path: string, hook: Hook, transform: FnOne) {
        const dummyCreate = (newVal) => (a, b, c, callback) => dummyCreate,
              rootProperty = path.split('.').shift(),
              initialValue = deepValue(this, path),
              typeOfValue = (typeof transform(initialValue)).toLowerCase(),
              conf = collect(binders, this)[rootProperty],
              update = (val) => {
                  if (/boolean/.test(typeOfValue)) {
                      bindBoolean.call(this, null, val, hook, transform, conf, dummyCreate)
                  } else if (/string|number|undefined/.test(typeOfValue)) {
                      bindStringOrNumber.call(this, null, val, hook, transform, conf, dummyCreate)
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

    const identity = (el) => true

    function createObserver(property: string, value: Primitive, hook: Hook, conf: BindProperties, transform: Function) {
        const typeOfValue = Array.isArray(value) ? 'array' : (typeof value).toLowerCase(),
              initialValue = this[property]
        if (/boolean/.test(typeOfValue)) {
            bindBoolean.call(this, property, initialValue, hook, transform, conf, createListener)
        } else if (/string|number|undefined/.test(typeOfValue)) {
            bindStringOrNumber.call(this, property, initialValue, hook, transform, conf, createListener)
        } else if (/array/.test(typeOfValue) || isFunction(value)) {
            if (Array.isArray(value)) {
                transform = identity.bind(this)
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

    export class Observable extends RouteAware {

        attachHooks(hooks: Hook[], parent?: any) {
            const context: Widget = parent || this
            for (const hook of hooks) {
                const property     = hook.property,
                      conf         = collect(binders, this)[property],
                      transform    = compose<any>(hook.transformFns
                                        .map(method =>
                                            context[method].bind(context)))

                let   value = this[property],
                      storedValue

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
                } else if (!parent && conf.localStorage) {
                    try {
                        const json = localStorage.getItem(getPath(this, property))
                        if (json) {
                            storedValue = JSON.parse(json).value
                        }
                    } catch (e) {
                        console.warn(e)
                    }
                    if (isDef(storedValue)) {
                        if (Array.isArray(storedValue)) {
                            const serializer = collect(serializers, this)[property]
                            this[property] = storedValue.map(this[serializer.read])
                        } else {
                            this[property] = value = storedValue
                        }
                    }
                }
                createObserver.call(this, property, transform(value), hook, conf, transform)
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
