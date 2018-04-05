module feather.observe {

    import Widget           = feather.core.Widget
    import RouteAware       = feather.routing.RouteAware
    import Hook             = feather.annotations.Hook
    import HookType         = feather.annotations.HookType
    import TypedMap         = feather.types.TypedMap
    import FnOne            = feather.types.FnOne
    import Primitive        = feather.types.Primitive
    import OldNewCallback   = feather.types.OldNewCallback
    import observeArray     = feather.arrays.observeArray
    import from             = feather.arrays.from
    import notifyListeners  = feather.arrays.notifyListeners
    import isFunction       = feather.functions.isFunction
    import compose          = feather.functions.compose
    import isDef            = feather.functions.isDef
    import isUndef          = feather.functions.isUndef
    import isObject         = feather.objects.isObject
    import deepValue        = feather.objects.deepValue
    import ensure           = feather.objects.ensure
    import collect          = feather.objects.collectAnnotationsFromTypeMap
    import observe          = feather.objects.createObjectPropertyListener
    import values           = feather.objects.values
    import Subscribable     = feather.hub.Subscribable
    import WidgetFactory    = feather.boot.WidgetFactory
    import getFragment      = feather.annotations.getFragment
    import domArrayListener = feather.arrays.defaultArrayListener

    const boundProperties   = new WeakMap<any, TypedMap<Function[]>>()
    const binders           = new WeakMap<any, TypedMap<BindProperties>>()
    const computed          = new WeakMap<any, TypedMap<string[]>>()
    const identity          = () => () => true

    export interface BindProperties {
        templateName?:  string   // when pushing new widgets into an array, the template name to render the children with
        localStorage?:  boolean  // initialize values from local storage
        bequeath?:      boolean  // child widget can bind this in their own templates
        html?:          boolean  // string contains html, do not bind to template root. experimental.
        affectsArrays?: string[] // let feather know, that changing this property should reevaluate bindings on an array in a parentwidget
        property?:      string   // internal property name reference, cannot be set externally
    }

    const setOrRemoveAttribute = (el: Element, attribute: string, condition: boolean, val: string) => {
        if (attribute === 'value') {
            (el as HTMLInputElement).value = condition ? val : ''
        }
        else if (condition) {
            el.setAttribute(attribute, val)
        }
        else {
            el.removeAttribute(attribute)
        }
    }

    function createListener(obj: Observable,
                            conf: BindProperties,
                            property: string,
                            cb: OldNewCallback<Primitive>) {
        let value = obj[property]

        // arrays are special case so we sort of fake getters and setters
        if (Array.isArray(value)) {
            // this is for arrays transformed to strings or booleans
            observeArray(value, {
                sort: () => cb(value),
                splice: () => cb(value),
            })
        }
        else {
            const binders    = boundProperties.get(obj),
                  isObserved = binders && binders[property],
                  listeners  = ensure(boundProperties, obj, {[property]: [cb]})
            if (!isObserved) {
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
                        }
                        return newValue
                    }
                })
            }
            if (conf && conf.affectsArrays.length) {
                const n = conf.affectsArrays.length
                let   pw: Subscribable = obj, i, arr
                do {
                    for (i = 0; i < n; i++) {
                        arr = pw[conf.affectsArrays[i]]
                        if (isDef(arr)) {
                            ensure(boundProperties, obj, {[property]: [() => notifyListeners(arr)]})
                        }
                    }
                } while (isDef(pw = pw.parentWidget))
            }
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
                    }
                    else {
                        setOrRemoveAttribute(el, attributeName, !!transform(val), '')
                    }
                    return updateDom
                }
            createListener(this, conf, hook.property, updateDom(value))
        }
        else {
            throw Error('Bool value can only be bound to attributes ie. hidden="{{myBool}}. ' +
                'Consider using filters to convert them to strings (true|false|yes|no etc)"')
        }
    }

    function bindPrimitive(value: string|number,
                           hook: Hook,
                           transform: FnOne,
                           conf: BindProperties,
                           createListener: Function) {
        const el = hook.node

        if (hook.type === HookType.TEXT) { // <p>some text {{myVar}} goes here</p>
            let oldNodes = [el],
                oldValue
            const updateDom = (value) => {
                const newValue: string = transform(value)
                if (oldValue !== newValue) {
                    if (conf.html) {
                        const html = getFragment(newValue),
                            toRemove = oldNodes.slice(),
                            parent = toRemove[0].parentNode
                        oldNodes = from<Element>(html.childNodes)
                        parent.replaceChild(html, toRemove.shift())
                        toRemove.forEach(node => node.parentNode.removeChild(node))
                    }
                    else {
                        el.textContent = transform(value)
                    }
                    oldValue = newValue
                }
                return updateDom
            }
            createListener(this, conf, hook.property, updateDom(value))
        }
        else if (hook.type === HookType.CLASS) { // <p class="red {{myVar}}">text goes here</p>
            let oldValue
            const updateDom = (val: any) => {
                const nVal: string = transform(val)
                if (nVal !== oldValue) {
                    if (isDef(oldValue)) {
                        el.classList.remove(oldValue)
                    }
                    if (isDef(nVal)) {
                        el.classList.add(nVal)
                    }
                    oldValue = nVal
                }
                return updateDom
            }
            createListener(this, conf, hook.property, updateDom(value))
        }
        else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) { // <p style="{{myvar}}" {{hidden}}>text goes here</p>
            let oldValue
            const attributeName = hook.attribute || hook.property,
                  updateDom = (val) => {
                      const formatted = transform(val)
                      if (formatted !== oldValue) {
                          setOrRemoveAttribute(el, attributeName, isDef(formatted), formatted as string)
                          oldValue = formatted
                      }
                      return updateDom
                  }
            createListener(this, conf, hook.property, updateDom(value))
        }
    }

    function bindArray(arr: Widget[], hook: Hook, conf: BindProperties, transform: Function) {
        if (hook.type === HookType.PROPERTY) {
            const removed = arr.splice(0, arr.length)
            observeArray(arr, domArrayListener(this, arr, hook, conf, transform))
            arr.push(...removed)
        }
        else {
            console.log('Arrays can be bound only in a node: <div {{myarray}}></div>')
        }
    }

    function createDeepObserver(path: string, hook: Hook, initialValue: any, transform: FnOne) {
        const dummyCreate = (a, b, c, callback) => observe(this, path, callback),
              rootProperty = path.split('.').shift(),
              typeOfValue = (typeof transform(initialValue)).toLowerCase(),
              conf = collect(binders, this)[rootProperty]
        if ('boolean' === typeOfValue) {
            bindBoolean.call(this, initialValue, hook, transform, conf, dummyCreate)
        }
        else if (/string|number|undefined/.test(typeOfValue)) {
            bindPrimitive.call(this, initialValue, hook, transform, conf, dummyCreate)
        }
        else {
            console.log(
                'Deeply bound properties work only with strings, numbers or booleans. ' +
                'For arrays you can use a transformer: {{var:myTransformer}}?'
            )
        }
    }

    function createStyleObserver(property: string, hook: Hook) {
        const el       = hook.node as HTMLElement,
              update   = (val) => {
                  Object.keys(val).forEach(key => {
                      el.style[key] = val[key]
                  })
                  return update
              }
        observe(this, property, update(this[property]))
    }

    function createObserver(widget: Observable, transformedValue: Primitive|Function, hook: Hook,
                            conf: BindProperties, transform: Function) {
        const typeOfValue = Array.isArray(transformedValue) ? 'array' : (typeof transformedValue).toLowerCase(),
              initialValue = widget[hook.property]
        if ('boolean' === typeOfValue) {
            bindBoolean.call(widget, initialValue, hook, transform, conf, createListener)
        }
        else if (/string|number|undefined/.test(typeOfValue)) {
            bindPrimitive.call(widget, initialValue, hook, transform, conf, createListener)
        }
        else if ('array' === typeOfValue || isFunction(transformedValue)) {
            if (!isFunction(transformedValue)) {
                transform = identity
            }
            bindArray.call(widget, initialValue, hook, conf, transform)
        }
        else {
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
        }
        else {
            tryToBindFromParentWidget(current.parentWidget as Widget, context, hook, property)
        }
    }

    // transformers can also exist on singletons and be used where ever
    const findFromSingletons = (start: Observable, method: string) => {
        const widgets = WidgetFactory.singletonRegistry
        for (let i = 0; i < widgets.length; i++) {
            const func = widgets[i][method]
            if (func) {
               return func.bind(start)
            }
        }
        throw Error(`Couldn't resolve transformer function ${method}`)
    }

    function bindComputers(widget: Observable, computers: string[],
                           hook: Hook, transform: Function, binders: TypedMap<BindProperties>) {
        let oldValue
        const updateDom = () => {
            const formatted = transform(widget[hook.property].call(widget))
            if (oldValue !== formatted) {
                if (hook.type === HookType.TEXT) {
                    hook.node.textContent = formatted
                } else if (hook.type === HookType.CLASS) {
                    if (oldValue) {
                        hook.node.classList.remove(oldValue)
                    }
                    if (formatted) {
                        hook.node.classList.add(formatted)
                    }
                } else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) {
                    if (!formatted) {
                        hook.node.removeAttribute(hook.attribute)
                    } else {
                        hook.node.setAttribute(hook.attribute, formatted)
                    }
                }
                oldValue = formatted
            }
            return updateDom
        }
        computers.forEach(property => {
            const conf = binders[property] || {property, affectsArrays: []}
            createListener(widget, conf, property, updateDom())
        })
    }

    export class Observable extends RouteAware {

        attachHooks(hooks: Hook[], parent?: any) {
            let   arrayTriggers: BindProperties[],
                  storableArrays: BindProperties[]
            const context: Widget = parent || this,
                  instanceBinders = collect(binders, this)
            if (instanceBinders) {
                const binders  = values(instanceBinders)
                arrayTriggers  = binders.filter(conf => conf.affectsArrays.length !== 0)
                storableArrays = binders.filter(conf => conf.localStorage && Array.isArray(this[conf.property]))
            }
            // load values from local storage
            if (isUndef(parent)) {
                loadLocalStorageValue(binders, this)
            }
            for (const hook of hooks) {
                const property     = hook.property,
                      transform    = compose<any>(hook.transformFns.map(method => {
                                         const func = context[method]
                                         return func ? func.bind(this) : findFromSingletons(this, method)
                                     })),
                      value = this[property],
                      isObj = isObject(value)
                // annotated functions are pointless
                if (isFunction(value)) {
                    const computers = collect(computed, this)[property]
                    if (isDef(computers)) {
                        bindComputers(this, computers, hook, transform, instanceBinders || {})
                    } else {
                        console.log('Binding to functions without @Computed() annotation is not supported. Use a property with a transformer {{x:myfunc}}.')
                    }
                    continue
                }
                // if hook has dot notation or we transform an object to a string or boolean
                else if (~property.indexOf('.') || isObj && hook.hasMethods()) {
                    const initialValue = deepValue(this, property)
                    // not found on current widget, check parent widgets for bequeath: true bindings
                    if (isUndef(initialValue)) {
                        tryToBindFromParentWidget(this.parentWidget as Observable, this, hook, property)
                    }
                    else {
                        createDeepObserver.call(this, property, hook, initialValue, transform)
                    }
                    continue
                }
                // all other objects
                else if (isObj) {
                    // if mapped to inline styles
                    if (hook.attribute === 'style') {
                        createStyleObserver.call(this, property, hook)
                        continue
                    }
                    // every other direct object binding is not permitted
                    else if (!hook.hasMethods()) {
                        console.log('Binding to objects is not supported. Use new widgets or specify inner property: x.y.z')
                        continue
                    }
                }
                const conf = instanceBinders[property]
                // conf missing look up bequeath: true bindings from parent widgets
                if (isUndef(conf)) {
                    tryToBindFromParentWidget(this.parentWidget as Observable, this, hook, property)
                    continue
                }
                // now let's do the real binding
                createObserver(this, transform(value), hook, conf, transform)
            }
            // all properties that trigger array refresh are bound here
            if (arrayTriggers) {
                for (const trigger of arrayTriggers) {
                    createListener(this, trigger, trigger.property, () => 0)
                }
            }
            // assign local storage persistence if annotated
            if (storableArrays) {
                for (const toStore of storableArrays) {
                    const arr = this[toStore.property],
                          store = () => maybeStore(this, toStore.property, toStore, arr, true)
                    observeArray(arr, {
                        sort: store,
                        splice: store
                    })
                }
            }
        }

        cleanUp() {
            super.cleanUp()
            boundProperties.delete(this)
            computed.delete(this)
        }
    }

    export const Bind = (props?: BindProperties) => (proto: Observable, property: string) => {
        const defProps: BindProperties = {
            templateName: 'default',
            localStorage: false,
            affectsArrays: [],
            property,
            html: false
        },
        finalProps = {...defProps, ...(props || {})}
        ensure(binders, proto, {[property]: finalProps})
    }

    export const Computed = (...props: string[]) => (proto: Observable, property: string) => {
        ensure(computed, proto, {[property]: props})
    }

    export interface Serializer {
        write?: string,
        read?: string
    }

}
