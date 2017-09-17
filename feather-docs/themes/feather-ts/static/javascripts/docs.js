var feather;
(function (feather) {
    var docs;
    (function (docs) {
        var Template = feather.annotations.Template;
        var Bind = feather.observe.Bind;
        var Widget = feather.core.Widget;
        var Construct = feather.annotations.Construct;
        var MyApplication = /** @class */ (function (_super) {
            __extends(MyApplication, _super);
            function MyApplication() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.who = 'world';
                return _this;
            }
            MyApplication.prototype.init = function (element) {
                this.render('default');
                setTimeout(function () {
                    this.who = "everyone";
                }.bind(this), 2000);
            };
            MyApplication.prototype.getBaseTemplate = function () {
                return "Hello {{who}}!";
            };
            __decorate([
                Bind()
            ], MyApplication.prototype, "who", void 0);
            __decorate([
                Template('default')
            ], MyApplication.prototype, "getBaseTemplate", null);
            MyApplication = __decorate([
                Construct({ selector: '.hello-world' })
            ], MyApplication);
            return MyApplication;
        }(Widget));
    })(docs = feather.docs || (feather.docs = {}));
})(feather || (feather = {}));
var feather;
(function (feather) {
    var docs;
    (function (docs) {
        var Widget = feather.core.Widget;
        var Template = feather.annotations.Template;
        var Construct = feather.annotations.Construct;
        var Media = feather.media.Media;
        var Responsive = /** @class */ (function (_super) {
            __extends(Responsive, _super);
            function Responsive() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Responsive.prototype.renderMobile = function () {
                this.render('mobile', true);
            };
            Responsive.prototype.renderDesktop = function () {
                this.render('desktop', true);
            };
            Responsive.prototype.markupMobile = function () {
                return "Mobile version";
            };
            Responsive.prototype.markupDesktop = function () {
                return "Desktop version";
            };
            __decorate([
                Media('(max-width: 768px)')
            ], Responsive.prototype, "renderMobile", null);
            __decorate([
                Media('(min-width: 769px)')
            ], Responsive.prototype, "renderDesktop", null);
            __decorate([
                Template('mobile')
            ], Responsive.prototype, "markupMobile", null);
            __decorate([
                Template('desktop')
            ], Responsive.prototype, "markupDesktop", null);
            Responsive = __decorate([
                Construct({ selector: '.responsive' })
            ], Responsive);
            return Responsive;
        }(Widget));
        docs.Responsive = Responsive;
    })(docs = feather.docs || (feather.docs = {}));
})(feather || (feather = {}));
var feather;
(function (feather) {
    var docs;
    (function (docs) {
        var Widget = feather.core.Widget;
        var Template = feather.annotations.Template;
        var Bind = feather.observe.Bind;
        var NaviItem = /** @class */ (function (_super) {
            __extends(NaviItem, _super);
            function NaviItem(link, text) {
                var _this = _super.call(this) || this;
                _this.link = link;
                _this.text = text;
                return _this;
            }
            NaviItem.prototype.markup = function () {
                return "<li><a href=\"{{link}}\">{{text}}</a></li>";
            };
            __decorate([
                Bind()
            ], NaviItem.prototype, "text", void 0);
            __decorate([
                Bind()
            ], NaviItem.prototype, "link", void 0);
            __decorate([
                Template()
            ], NaviItem.prototype, "markup", null);
            return NaviItem;
        }(Widget));
        docs.NaviItem = NaviItem;
    })(docs = feather.docs || (feather.docs = {}));
})(feather || (feather = {}));
var feather;
(function (feather) {
    var docs;
    (function (docs) {
        var Widget = feather.core.Widget;
        var Construct = feather.annotations.Construct;
        var Template = feather.annotations.Template;
        var Bind = feather.observe.Bind;
        var from = feather.arrays.from;
        var NaviItem = feather.docs.NaviItem;
        var SubNavigation = /** @class */ (function (_super) {
            __extends(SubNavigation, _super);
            function SubNavigation() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.children = [];
                return _this;
            }
            SubNavigation.prototype.init = function (el) {
                var h2 = from(document.querySelectorAll(".wrapper h2"));
                if (h2.length > 3 && /documentation/.test(document.location.href)) {
                    (_a = this.children).push.apply(_a, h2.map(function (h2) {
                        return new NaviItem("#" + h2.id, h2.textContent.substring(1));
                    }));
                    this.render();
                }
                var _a;
            };
            SubNavigation.prototype.markup = function () {
                return "<ul class=\"subnavigation\" {{children}}></ul>";
            };
            __decorate([
                Bind()
            ], SubNavigation.prototype, "children", void 0);
            __decorate([
                Template()
            ], SubNavigation.prototype, "markup", null);
            SubNavigation = __decorate([
                Construct({ selector: 'nav.subnavigation' })
            ], SubNavigation);
            return SubNavigation;
        }(Widget));
        docs.SubNavigation = SubNavigation;
    })(docs = feather.docs || (feather.docs = {}));
})(feather || (feather = {}));
var feather;
(function (feather) {
    var docs;
    (function (docs) {
        var Widget = feather.core.Widget;
        var Construct = feather.annotations.Construct;
        var On = feather.event.On;
        var format = feather.strings.format;
        var searchUrl = 'https://github.com/mendrik/feather/search?utf8=%E2%9C%93&q={{search}}&type=';
        var Search = /** @class */ (function (_super) {
            __extends(Search, _super);
            function Search() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Search.prototype.onEnter = function (ev, el) {
                if (ev.keyCode === 13) {
                    document.location.href = format(searchUrl, { search: el.value });
                }
            };
            __decorate([
                On({ event: 'keypress' })
            ], Search.prototype, "onEnter", null);
            Search = __decorate([
                Construct({ selector: '#search' })
            ], Search);
            return Search;
        }(Widget));
    })(docs = feather.docs || (feather.docs = {}));
})(feather || (feather = {}));
feather.start();
//# sourceMappingURL=docs.js.map