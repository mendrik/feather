module feather.dom {

    import ValidRoot = feather.types.ValidRoot

    const NODE_FILTER = (n: Node) => {
        const nodeType = n.nodeType
        if (nodeType === Node.ELEMENT_NODE) {
            return true
        } else if (nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
            return false
        } else if (nodeType === Node.TEXT_NODE && /^\s*$/.test(n.textContent)) {
            return false
        }
        return true
    }

    const _selectorMatches = ['matches' , 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'matchesSelector']
        .reduce((p, c) => Element.prototype[c] || p) as any as (s: string) => boolean

    export function querySelectorWithRoot(root: ValidRoot, selector: string): HTMLElement[] {
        const result: any[] = root.nodeType === Node.ELEMENT_NODE && selectorMatches(root, selector) ? [root] : []
        result.push.apply(result, root.querySelectorAll(selector))
        return result
    }

    export function selectorMatches(el: ValidRoot, selector: string): boolean {
        return _selectorMatches.call(el, selector)
    }

    export function allChildNodes(doc: Node): Node[] {
        this.acceptNode = NODE_FILTER
        const walker = document.createTreeWalker(doc, NodeFilter.SHOW_ALL, NODE_FILTER as any, false),
              nodes = []
        do {
            nodes.push(walker.currentNode)
        } while (walker.nextNode())
        return nodes
    }

    export function insertBefore(parent: Node, el: Node, first: Node = null) {
        parent.insertBefore(el, first)
    }
}
