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
    import hasListeners        = feather.arrays.hasListeners
    import changeArrayListener = feather.arrays.changeArrayListener
    import insertBefore        = feather.dom.insertBefore
    import getInheritedMethods = feather.functions.getInheritedMethods
    import isFunction          = feather.functions.isFunction
    import FuncOne             = feather.functions.FuncOne
    import compose             = feather.functions.compose

    const boundProperties      = new WeakMap<Widget, TypedMap<Function[]>>()
    const binders              = new WeakMap<Observable, TypedMap<BindProperties>>()

    export interface BindProperties {
        templateName?: string // when pushing new widgets into an array, the template name to render the children with
        changeOn?:     string[] // when pushing new widgets into an array, the template name to render the children with
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
            let parent = obj.parentWidget as any
            for (let key of Object.keys(parent)) {
                let value = parent[key] as any[]
                if (hasListeners(value)) {
                    value.splice(0, 0)
                }
            }
        }
    }

    function createListener(obj: Widget, property: string, cb: (newVal?: Primitive, oldVal?: Primitive) => void) {
        let value = obj[property]

        if (Array.isArray(value)) { // arrays are special case so we sort of fake getters and setters
            observeArray(value, changeArrayListener(() => {
                cb(value)
                triggerParentArray(obj)
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
                get: function() {
                    return value
                },
                set: (newval: any) => {
                    if (newval !== value) {
                        let old = value
                        value = newval
                        for (let cb of listeners[property]) {
                            cb(newval, old)
                        }
                        triggerParentArray(obj)
                    }
                    return newval
                }
            })
            listeners[property].push(cb)
        }
    }

    function bindBoolean(property: string, hook: Hook, filter: FuncOne) {
        if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) {

            let el = (hook.node as HTMLElement),
                attributeName = hook.text || property

            if (!hook.text) {
                el.removeAttribute(`{{${hook.curly}}}`)
            } else {
                el.setAttribute(hook.text, '')
            }

            createListener(this, property, function updateDom(val) {
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

    function bindString(property: string, hook: Hook, filter: FuncOne) {
        let widget = this,
            el     = hook.node as HTMLElement

        if (hook.type === HookType.TEXT) { // <p>some text {{myVar}} goes here</p>
            createListener(this, property, function updateDom() {
                hook.node.textContent = feather.strings.format(hook.text, widget, widget)
                return updateDom
            }())
        } else if (hook.type === HookType.CLASS) { // <p class="red {{myVar}}">text goes here</p>
            createListener(this, property, function updateDom(val, old?) {
                if (typeof old !== 'undefined') {
                    let fOld = filter(old)
                    if (fOld) {
                        el.classList.remove(fOld)
                    }
                }
                if (typeof val !== 'undefined') {
                    let fVal = filter(val)
                    if (fVal) {
                        el.classList.add(fVal)
                    }
                }
                return updateDom
            }(this[property]))
            el.classList.remove(`{{${hook.curly}}}`)
        } else if (hook.type === HookType.ATTRIBUTE || hook.type === HookType.PROPERTY) { // <p style="{{myvar}}" {{hidden}}>text goes here</p>
            let attribName = hook.text || property

            createListener(this, property, function updateDom(val) {
                let formatted = filter(val)
                setOrRemoveAttribute(el, attribName, typeof formatted !== 'undefined', formatted)
                return updateDom
            }(this[property]))

            if (!hook.text) {
                el.removeAttribute(`{{${hook.curly}}}`)
            }
        }
    }

    function defaultArrayListener(hook: Hook, conf: BindProperties, widget: Widget): ArrayListener<Widget> {
        let el = hook.node as HTMLElement
        return {
            reverse() {
                for (let child of from<HTMLElement>(el.children)) {
                    insertBefore(el, child, el.firstElementChild)
                }
            },
            sort(indices: any[]) {
                let children = from<HTMLElement>(el.children)
                indices.map(i => children[i]).map(c => el.appendChild(c))
            },
            splice(index: number, deleteCount: number, added: any[], deleted: any[]) {
                requestAnimationFrame(() =>
                    from<HTMLElement>(el.children)
                        .slice(index, index + deleteCount)
                        .map(del => el.removeChild(del)))

                let childWidgets = widget.childWidgets

                feather.arrays.removeFromArray(childWidgets, deleted || [])

                if (added && added.length) {
                    let frag = document.createDocumentFragment()
                    for (let item of added) {
                        item.appendTemplateRoot(frag, conf.templateName)
                        item.parentWidget = widget
                    }
                    childWidgets.push.apply(childWidgets, added)
                    requestAnimationFrame(() => insertBefore(el, frag, el.children[index]));
                }
            }
        }
    }

    function bindArray(arr: Widget[], hook: Hook, conf: BindProperties) {
        let removed = arr.splice(0, arr.length),
            el      = hook.node as HTMLElement
        observeArray(arr, defaultArrayListener(hook, conf, this))
        el.removeAttribute(`{{${hook.curly}}}`)
        arr.push.apply(arr, removed)
    }

    function createObserver(property: string, value: Primitive, hook: Hook, conf: BindProperties, filter: FuncOne) {
        let typeOfValue
        if (typeof value === 'undefined') {
            typeOfValue = 'string' // it's the only possibility that makes sense here
        } else {
            typeOfValue = (Array.isArray(value) ? 'array' : typeof value).toLowerCase()
        }
        if (/boolean/.test(typeOfValue)) {
            bindBoolean.call(this, property, hook, filter)
        } else if (/string|number/.test(typeOfValue)) {
            bindString.call(this, property, hook, filter)
        } else if (/array/.test(typeOfValue)) {
            bindArray.call(this, this[property], hook, conf)
        } else {
            console.log('Bindings are only supported on arrays, booleans, strings and numbers')
        }
    }

    function createFilteredArrayProxy(property: string, hook: Hook, conf: BindProperties,
                                      filter: () => (widget: Widget) => boolean) {
        let proxy              = [],
            original: Widget[] = this[property],
            doc                = document.createDocumentFragment(),
            copy = () => {
                original.forEach(item => item.appendTemplateRoot(doc, conf.templateName)) // let's init the items
                proxy.splice.apply(proxy, [0, proxy.length].concat(original.filter(filter()) as any[]))
            }

        copy()
        bindArray.call(this, proxy, hook, conf)
        observeArray(original, changeArrayListener(copy))

        for (let prop of conf.changeOn || []) {
            createListener(this, prop, () => original.splice(0,0))
        }
    }

    export class Observable extends feather.routing.RouteAware {

        protected attachHooks(hooks: Hook[]) {
            for (let hook of hooks) {

                let filterFunctions = hook.curly.split(/:/),
                    property = this.findProperty(filterFunctions.shift()),
                    value = this[property],
                    conf = binders.get(Object.getPrototypeOf(this))[property],
                    filter = compose<any>(filterFunctions
                                .map(this.findMethod.bind(this))
                                .map((method: string) => this[method].bind(this)))

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
                } else {
                    createObserver.call(this, property, value, hook, conf, filter)
                }
            }
        }

        // attributes are case insensitive, so let's try to find the matching property like this
        findProperty(ci: string): string {
            return Object.getOwnPropertyNames(this)
                .find(p => p.toLowerCase() === ci.toLowerCase()) || ci
        }

        findMethod(ci: string): string {
            return getInheritedMethods(this)
                    .find(p => p.toLowerCase() === ci.toLowerCase()) || ci
        }
    }

    export let Bind = (props: BindProperties = {}) => (proto: Observable, property: string) => {
        let protoBinders = binders.get(proto)
        if (!protoBinders) {
            binders.set(proto, {
                [property]: props
            })
        } else {
            protoBinders[property] = props
        }
    }
}
