module feather.arrays {

    type MethodKey  = 'sort' | 'splice'
    type MuteMethodKey  = 'forEach'
    const observers = new WeakMap<any[], ArrayListener<any>[]>()
    const muteLock = new WeakMap<any[], boolean>()

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

    const notifyListenersWithArgs = (arr, method: MethodKey | MuteMethodKey, args: any[]) => {
        const listeners = observers.get(arr)
        for (const listener of listeners) {
            listener[method].apply(arr, args)
        }
    }

    function muteMethod<T>(key: MuteMethodKey, arr: any) {
        const old = arr[key]
        arr[key] = function () {
            muteLock.set(arr, true)
            old.apply(arr, arguments)
            muteLock.set(arr, false)
            notifyListenersWithArgs(arr, key, [0, 0, [], []])
        }
    }

    function duckPunch<T>(key: MethodKey, arr: any) {
        const old       = arr[key]
        if (key === 'splice') {
            // add docs that removing and re-adding elements to the same array kills event listeners
            arr.splice = function(index, deleteCount) {
                const addedItems = [].slice.call(arguments, 2),
                      deletedItems = old.apply(arr, arguments)
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
            duckPunch('splice', arr)
            duckPunch('sort', arr)
            muteMethod('forEach', arr)
        } else {
            listeners.push(listener)
        }
    }
}
