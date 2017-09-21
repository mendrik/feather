---
date: 2016-04-01T21:07:13+01:00
title: Getting started
---

## Widgets

Your application will be a collection of classes that must extend `feather.core.Widget`. The widget class itself 
inherits other internal classes in the following order, which represent different aspects of the framework.
Within the classes you can decorate methods to enhance the instances. Decorators are collected throughout
the class hierarchy, which allows you to extend your own widget class with super classes of any kind.

* Your Widget Class
* Super Classes...
* Widget
* Observable
* RouteAware
* Subscribable
* EventAware
* MediaQueryAware
* Object

At its core a widget class is mounted to a single DOM element. It will hold a reference to that element, 
which can be accessed in your class via `this.element`. Furthermore it should have a method with an arbitrary
name: `@Template() myMarkup(templateName?: string): string`. This has to be called manually for the widget 
to render into its root element. This is usually done in the overridden `init(el: HTMLElement)` method. 
The rendered template is appended to the root element, however you can change the placement with a second
argument to the render call with a value from `feather.core.RenderPlacement` enum.

```
enum RenderPlacement {
    append,
    prepend,
    replace
}
```

`this.render()` has to be called manually because feather does not make assumption when to render the widget; 
it might be required to fetch data from the server or wait for other events to complete first. If a widget is not 
added to an array, templates can return several root-nodes (this differs a bit from *React* with jsx for example). 

*Mounting* is done automatically once you call `feather.start()`. 

Furthermore you can also have renderless widgets, that just attach dom events or manipulate their childNodes. 
 
A widget usually comes with a `@Construct({selector: string, ...})` class decorator, which defines which 
HTML elements the component will be appended to. Once the Widget has been created, you can override the 
`init(element: HTMLElement)` method in your class and call this.render(templateName) there. 

> Widgets don't require a constructor and custom initialization should be done in the overwritten `init` 
method. An exception to this are array-widgets. Array widget are widgets that are pushed into an array
property of another widget. They differ in so far that they don't require a `this.render()` call nor must
they have a `@Construct` decorator.

You can have different template generating methods in the same widget class and choose which one to run
when calling `this.render()`. For this use a specific template name in the `@Template` decorator and call
`this.render(chosenName)` accordingly.

Putting it all together, a very simple widget looks like this:
 
```typescript
 module demo {
 
     import Widget    = feather.core.Widget
     import Construct = feather.annotations.Construct
     import Template  = feather.annotations.Template
 
     @Construct({selector: 'body'})
     export class MyApplication extends Widget {
 
         who = 'world'   
 
         init(element: HTMLElement) {
             this.render()
         }
 
         @Template()
         protected getBaseTemplate() {
             return `Hello ${this.who}!`
         }
     }
 }
 ```
 
Call now `feather.start()` and your application will render itself into `<body>`. 

## Widget tree
Widgets form internally a tree whenever they are referenced in a template or pushed to 
a bound array property. However they do not align according to the dom hierarchy in the template.
What that means is that all widgets in a template will have their parentWidget set to the
component creating the template and not the parent tag inside the template.

## Bindings
Bindings are links between a widget property and a place inside the template method. They are
referenced by using double curly braces `{{property.subproperty:method1:method2}}`. Subproperties
are optional and can be used if the bound property is a hierarchical object. The path you bind to, 
will modify the target object with setters and getters, so Feather is aware of the changes within that
path. 

> Deep properties in an object that are not referenced in a template remain untouched and are not wrapped
with getters anf setters.

Also optional is the set of methods. Those are called transformers and can change the type 
of a bound property to something that can be rendered. For example you can convert Date objects
to localized strings. The transformer must be defined on the class that holds the template, even if 
you inherit a property via `@Bind({bequeath: true})`. 

> A special case are classes that are annotated as singletons via `@Construct({singleton: true})`. 
Their methods are also available as a transformers, regardless of their placement.  

### Dynamic content

If you need to swap out larger parts of the DOM, the only way to do this in Feather is to utilize
bound arrays. I.e. if you have a routing component that swaps pages define an array property and 
call `pages.splice(0, 1, myNewPage)`. This differs a bit from frameworks where the templates
can contain if/else statements to render the content. We find that logic-less templates are easier
to read, especially as the project grows.

## Passing arguments to widgets

If you need to pass data from a widget to its children (usually referenced in its template), there are 
several possibilities but all of them are done via constructor arguments collected from their 
dom attributes.

If you need to pass data to widget at a later point of the application flow, you should use the 
internal message hub instead, see [@Subscribe](/documentation/#subscribe) and the corresponding 
`triggerUp`/`triggerDown`/`triggerSingleton` methods.

### String attributes
 
The simplest case is using string attributes: `<my-widget attr1="str1" attr2="str2">`. In your 
*MyWidget* class the @Construct decorator should have an attribute array defined like so 
`@Construct({selector: 'my-widget', attributes: ['attr1', 'attr2']})`. Additionally provide a 
constructor with the following signature: `constructor(attr1: string, attr2: string) {`. 
The order of the attributes must match the constructor's arguments.

### Complex types

If you need to pass something else than strings to the widget you can use *single* curly braces to do this: 
`<my-widget attr1={true} attr2={2+2} attr={propertyName}>`. If the text between the curly braces matches 
a property name in the parent widget its value will be used otherwise any valid javascript statement can 
be used.    

## Observable

Feather provides one-way data-binding, which means you can create *hooks* between the component's 
data and the DOM. Whenever the data changes your DOM will update accordingly. There are several hook types, 
which are explained below. Feather does not use a virtual dom, instead it binds directly to native DOM 
modifiers. 
Hooks are basically class properties with a [@Bind()](/documentation/#bind) decorator their name wrapped in
double curly braces inside a template method. You can add hooks to:

### Primitives

The above example is quite rudimentary and in order to change the variable `who` one would need 
to call `render('default', RenderPlacement.replace)` again to see it. This is a little bit cumbersome and expensive, 
since the widget would then re-render the entire template and re-create any children referenced within. To avoid this 
you can decorate primitive members, arrays and with some restrictions also objects with a `@Bind()` 
decorator like this:

<div class="hello-world demo"></div>

```typescript
module feather.docs {

    import Template = feather.annotations.Template;
    import Bind = feather.observe.Bind;
    import Widget = feather.core.Widget;
    import Construct = feather.annotations.Construct;
    import On = feather.event.On

    @Construct({selector: '.hello-world'})
    class MyApplication extends Widget {

        @Bind() who = 'world'

        init(element: HTMLElement) {
            this.render('default')
        }
        
        @On({event: 'click', selector: 'button'})
        click() {
            this.who = 'everyone'
        }

        @Template('default')
        protected getBaseTemplate() {
            return `Hello {{who}}! <button>Change</button>`
        }
    }
}

```

Now whenever the value of `who` changes, the text node will update automatically. 
You can bind properties in 4 different places within a template and in combination with the property type only some of 
them make sense. Let's have a look:
 
* <div>`<div class="right {{variable}} large">...</div>`<br>As a new class in the class attribute (only strings)</div>
* <div>`<div class="red" style="{{variable}}">...</div>`<br>Within an arbitrary attribute (only strings and booleans)</div>
* <div>`<div class="red" {{variable}}>...</div>`<br>As a property hook (booleans and arrays but no transformer methods)</div>
* <div>`<div class="red">Some {{variable}} text!</div>`<br>Within a text node (only strings)</div>

> Note that any binding can convert booleans, numbers, objects or arrays into strings. This is done but declaring a *transformer* 
> function in the widget class. You can then bind it like this: `<div class="{{variable:formatAsString}}">...</div>`

### Attributes

When binding primitives as attributes the property value is passed on to the attribute's value. If the value is
`undefined` the attribute is removed from the dom.

### Booleans

Booleans are bound almost the same way as primitives, but there are a few shortcuts that can be used:
 
  * <div>`<div class="right {{variable}} large">...</div>`<br> 
     Not supported. Consider using a transformer function, must be declared on the same widget class which returns a string.</div>  
  * <div>`<div class="red" style="{{variable}}">...</div>`<br>if variable is true the attribute will be set, if `undefined` removed</div>
  * <div>`<div class="red" {{variable}}>...</div>`<br>Special shortcut where the attribute's name is same as the variable. This is 
  useful for attributes like *checked* or *hidden*</div>
  * <div>`<div class="red">Some {{variable}} text!</div>`<br>Not supported, use a transformer function to convert to a string.</div>

 
### Arrays

Array bindings are maybe the most important ones, since they allow to map list structures to dom child nodes. 
This can be used to render different application pages or different mobile/desktop representations of your components or
just a list of data objects. 

> Bound arrays must contain only other widget instances, not primitive values or objects because Feather must know
how to render them and attach events to those elements, if needed.

Array hooks can be placed in only one manner:

  First declare `@Bind({}) variable: MyWidget[] = []` which contains instances that *must* extend `feather.core.Widget`.
  One can use any of the native array functions to modify the array, but you must not replace the array itself 
  as the bindings and hooks would be lost. Array.fill is unsupported, because the children cannot be duplicates of one other.
  Furthermore never set children directly `array[2] = mywidget` because the change will be missed, so use splice instead: 
  `array.splice(2, 1, mywidget)`.
  Read more about bindings in the [decorator](/documentation) section. Make sure **not** to call `this.render()` on widgets 
  that are pushed to a bound array and you can skip the `@Construct()` decorator, too.

  * `<div class="red" {{variable}}>...</div>` 
  
> Please don't use the same children in two different array bindings. Since children are also widgets 
> they must have one unique DOM element they attach to. Having the same child in different arrays, would 
> simply move the element between DOM places with weird side-effects.

#### Filtered Arrays

When binding arrays with a transformer function `{{myarray:transformerFn}}` the result differs depending 
on the transformer's return type. If it returns a primitive type the binding behaves the same way it would 
when binding a primitive type (be aware that the framework will execute one "sniff" call to determine this). 
However, if the transformer returns a function, this will be used to filter the array and remove filtered out 
elements from the DOM. Essentially, it is a function that returns a filter function: 

```
   transformer = () => (el: MyChildWidget) => boolean
```

Check the [listFilter](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts#L79) in our sample 
application and its [definition](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts#L40)

### Objects

There are no object bindings in feather. If you need sub-components you should consider creating a 
new widget and add it via template tags or push it to a locally bound array.

There is however to possibility to *deep* bind properties: If a widget property is a complex object,
you can assign template hooks via object dot notation: `{{property.x.y.z}}</div>`. The root
object will internally be observed so whenever any of the internal values change the template hook
will be re-rendered (or the object itself for that matter). This also works in combination with inherited 
bindings `@Bind({bequeath: true}` from parent widgets and transformers: 
```
<div>{{parentProperty.x.y.z:calculate}}</div>
```
Even though deep arrays are also observed, you cannot access its children properties with the dot notation.

> Don't confuse inherited properties as class inherited ones. For a child widget to access parent widget's
> properties, the widget must be either added to a parent's widget array or referenced somewhere in the
> template tag hierarchy.

### Inline styles

One exception to the object bindings are inline styles. When the attribute is `style` you can set the value
to `{{myStyleObj}}` property, which will update the inline styles whenever the myStyleObj properties change.

## Imports

Feather uses internal module imports and no module loaders, so the imports are written like this:

```typescript
module mypackage {

    import Widget       = feather.core.Widget
    import Construct    = feather.annotations.Construct

    @Construct({selector: 'body.my-app'})
    export class MyApplication extends Widget {
       ...
    }
```

Make sure the files are listed in correct order in your `tsconfig.json`. Since the goal is to keep everything 
minimal and blazing fast it is advised to compress all your app code into a single file. 
