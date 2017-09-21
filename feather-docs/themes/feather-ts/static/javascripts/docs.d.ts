/// <reference types="feather-ts" />
declare module feather.docs {
}
declare module feather.docs {
}
declare module feather.docs {
    import Widget = feather.core.Widget;
    class Responsive extends Widget {
        renderMobile(): void;
        renderDesktop(): void;
        markupMobile(): string;
        markupDesktop(): string;
    }
}
declare module feather.docs {
    import Widget = feather.core.Widget;
    class NaviItem extends Widget {
        text: any;
        link: any;
        constructor(link: string, text: string);
        markup(): string;
    }
}
declare module feather.docs {
    import Widget = feather.core.Widget;
    import NaviItem = feather.docs.NaviItem;
    class SubNavigation extends Widget {
        children: NaviItem[];
        init(el: HTMLElement): void;
        markup(): string;
    }
}
declare module feather.docs {
}
