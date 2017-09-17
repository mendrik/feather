module feather.docs {


    import Widget = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template = feather.annotations.Template
    import Bind = feather.observe.Bind
    import from = feather.arrays.from
    import NaviItem = feather.docs.NaviItem

    @Construct({selector: 'nav.subnavigation'})
    export class SubNavigation extends Widget {

        @Bind() children: NaviItem[] = []

        init(el: HTMLElement) {
            const h2 = from<HTMLElement>(document.querySelectorAll(".wrapper h2"))
            if (h2.length > 3 && /documentation/.test(document.location.href)) {
                this.children.push(...h2.map(h2 => {
                    return new NaviItem( "#" + h2.id, h2.textContent.substring(1))
                }))
                this.render();
            }
        }

        @Template()
        markup() {
            return `<ul class="subnavigation" {{children}}></ul>`
        }

    }
}
