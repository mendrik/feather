let tds = [].slice.call(document.querySelectorAll('td'))
tds.forEach((td) => {
    if (td.children.length === 0) {
        td.setAttribute('contains', td.textContent)
    }
})

let uls = [].slice.call(document.querySelectorAll('td > ul:first-child'))

uls.forEach((ul) => {
    ul.parentElement.setAttribute('li-count', ul.children.length)
})
