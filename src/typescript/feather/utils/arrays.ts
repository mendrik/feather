module feather.arrays {

    type MethodKey  = 'sort' | 'splice'
    const observers = new WeakMap<any[], ArrayListener<any>[]>()

    export interface ArrayListener<T> {
        sort(indices: number[])
        splice(start: number, deleteCount: number, addedItems: T[], deletedItems: T[])
    }

    export function from<T>(object: any): T[] {
        return [].slice.call(object)
    }

    export function flatten<T>(array: T[]): T[] {
        return array.reduce((a, b) => a.concat(b), [])
    }

    export function removeFromArray(arr: any[], elements: any[]) {
        let deleteCount = 0,
            total = elements.length
        for (let i = arr.length; i--;) {
            if (~elements.indexOf(arr[i])) {
                deleteCount++ // optimize removal of consecutive elements
            } else if (deleteCount) {
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

    const notifyListenersWithArgs = (arr, method: MethodKey, args: any[]) => {
        const listeners = observers.get(arr)
        for (const listener of listeners) {
            listener[method].apply(arr, args)
        }
    }

    function createProperty<T>(key: MethodKey, arr: any) {
        const old       = arr[key]
        if (key === 'splice') {
            // add docs that removing and re-adding elements to the same array kills event listeners
            arr.splice = (index, deleteCount, ...addedItems) => {
                const deletedItems = old.call(arr, index, deleteCount, ...addedItems)
                notifyListenersWithArgs(arr, key, [index, deleteCount, addedItems, deletedItems])
                return deletedItems
            }
        } else if (key === 'sort') {
            arr.sort = (cmp) => {
                // sort is a special case, we need to inform listeners how sorting has changed the array
                const indices = range(0, arr.length - 1),
                      args = cmp ? [
                          arr.map ((e, i) => i)
                             .sort((a, b) => cmp(arr[a], arr[b]))
                             .map (e => indices[e])
                      ] : indices,
                      res = old.call(arr, cmp)
                notifyListenersWithArgs(arr, key, args)
                return res
            }
        }
    }

    export let notifyListeners = (source: any[]) => {
        for (const l of observers.get(source) || []) {
            l.splice(0, 0, [], [])
        }
    }

    export function diff<T>(arr1: T[], arr2: T[]): T[] {
        return arr1.filter(x => !~arr2.indexOf(x))
    }

    export interface Patch<T> {
        add: T[],
        remove: T[]
    }

    export const patch = <T>(target: T[], current: T[]): Patch<T> => ({
        add: diff(target, current),
        remove: diff(current, target)
    })

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
            createProperty('splice', arr)
            createProperty('sort', arr)
        } else {
            listeners.push(listener)
        }
    }

    export const lis = (x: number[]): number[] => {
        const n = x.length,
              len = new Array(n),
              pred = new Array(n)
        for (let i = 0, nn = n + 1; i < nn; i++) {
            len[i] = 1
            pred[i] = -1
        }
        for (let i = 1; i < n; i++) {
            for (let j = 0; j < i; j++) {
                if (x[j] < x[i] && len[i] < len[j] + 1) {
                    len[i] = len[j] + 1
                    pred[i] = j
                }
            }
        }
        let bi = 0
        for (let i = 1; i < n; i++) {
            if (len[bi] < len[i]) {
                bi = i
            }
        }
        let cnt = len[bi]
        const res = new Array(cnt)
        for (let i = bi; i !== -1; i = pred[i]) {
            res[--cnt] = x[i]
        }
        return res
    }
}
