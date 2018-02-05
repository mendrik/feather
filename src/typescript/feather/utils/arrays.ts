module feather.arrays {

    import Subscribable   = feather.hub.Subscribable
    import Widget         = feather.core.Widget
    import Hook           = feather.annotations.Hook
    import BindProperties = feather.observe.BindProperties
    type   MethodKey      = 'sort' | 'splice'
    type   MuteMethodKey  = 'forEach'
    const  observers      = new WeakMap<any[], ArrayListener<any>[]>()
    const  muteLock       = new WeakMap<any[], boolean>()
    const  NOOP_ARGS      = [0, 0, [], []]

    export interface ArrayListener<T> {
        sort(indices: number[])
        splice(start: number, deleteCount: number, addedItems: T[], deletedItems: T[])
    }

    export function from<T>(object: any): T[] {
        return [].slice.call(object)
    }

    export function removeFromArray(arr: any[], elements: any[]) {
        let deleteCount = 0,
            total = elements.length
        for (let i = arr.length; i--;) {
            if (~elements.indexOf(arr[i])) {
                deleteCount++ // optimize removal of consecutive elements
            }
            else if (deleteCount) {
                arr.splice(i + 1, deleteCount)
                if ((total -= deleteCount) === 0) { // if we removed all already, break early
                    deleteCount = 0
                    break
                }
                deleteCount = 0
            }
        }
        if (deleteCount) {
            arr.splice(0, deleteCount)
        }
    }

    const notify = (arr, method: MethodKey | MuteMethodKey, args: any[]) => {
        const mute = muteLock.get(arr)
        if (mute !== true) {
            const listeners = observers.get(arr)
            for (const listener of listeners) {
                listener[method].apply(arr, args)
            }
        }
    }

    function muteMethod<T>(key: MuteMethodKey, arr: any) {
        const old = arr[key]
        arr[key] = function () {
            muteLock.set(arr, true)
            const res = old.apply(arr, arguments)
            muteLock.set(arr, false)
            notify(arr, 'splice', NOOP_ARGS)
            return res
        }
    }

    function duckPunchSplice<T>(arr: any) {
        const old = arr.splice
        // add docs that removing and re-adding elements to the same array kills event listeners
        arr.splice = function (index, deleteCount) {
            const addedItems = [].slice.call(arguments, 2),
                deletedItems = old.apply(arr, arguments)
            notify(arr, 'splice', [index, deleteCount, addedItems, deletedItems])
            return deletedItems
        }
    }

    function duckPunchSort<T>(arr: any) {
        const old = arr.sort
        arr.sort = (cmp) => {
            // sort is a special case, we need to inform listeners how sorting has changed the array
            const indices = range(0, arr.length - 1),
                  args = cmp ? [
                      arr.map ((e, i) => i)
                         .sort((a, b) => cmp(arr[a], arr[b]))
                         .map (e => indices[e])
                  ] : indices,
                  res = old.call(arr, cmp)
            notify(arr, 'sort', args)
            return res
        }
    }

    export let notifyListeners = (source: any[]) => notify(source, 'splice', NOOP_ARGS)

    export const range = (start: number, end: number): number[] => {
        const len = end - start + 1,
              arr = new Array<number>(len)
        for (let i = 0, l = arr.length; i < l; i++) {
            arr[i] =  i + start
        }
        return arr
    }

    // essentially we can reduce array modifying functions to two implementations: sort and splice
    export const observeArray = <T>(arr: T[], listener: ArrayListener<T>) => {
        // replace this in the future with es6 proxies
        const listeners = observers.get(arr)
        if (!listeners) {
            observers.set(arr, [listener])
            arr.pop = function(): T {
                return arr.splice(arr.length - 1, 1)[0]
            }
            arr.push = function(...items: T[]): number {
                arr.splice(arr.length, 0, ...items)
                return arr.length
            }
            arr.fill = function(): T[] {
                throw Error('observed arrays cannot be filled. items must be unique, use Array.splice instead!')
            }
            arr.reverse = function() {
                const ref = arr.slice()
                arr.sort((a, b) => ref.indexOf(b) - ref.indexOf(a))
                return arr
            }
            arr.shift = function(): T {
                return arr.splice(0, 1)[0]
            }
            arr.unshift = function(...items: T[]): number {
                arr.splice(0, 0, ...items)
                return arr.length
            }
            duckPunchSplice(arr)
            duckPunchSort(arr)
            muteMethod('forEach', arr)
        }
        else {
            listeners.push(listener)
        }
    }

    const destroyListeners = (widgets: Subscribable[]) => {
        setTimeout(() => {
            for (const w of widgets) {
                w.cleanUp()
            }
        }, 50)
    }

    export function defaultArrayListener(widget: Widget, arr: Widget[], hook: Hook, conf: BindProperties,
                                         filterFactory: Function): ArrayListener<Widget> {
        const el = hook.node,
              firstChild = el.firstElementChild // usually null, lists that share a parent with other nodes are prepended.
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
                nodeVisible.splice(index, deleteCount, ...added.map(v => false))

                if (deleteCount) {
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
}
