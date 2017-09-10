---
date: 2016-10-01T21:07:13+01:00
title: API Documentation
weight: 20
---

## Widgets

Your application will be a collection of classes that must extend ```feather.core.Widget```. The widget class itself 
inherits other internal classes in the following order, which represent different aspects of the framework.
Within the classes you can decorate methods to enhance the instances. Decorators are collected throughout
the class hierarchy, which allows you to extends your own widget class with shared functionality.

```
MyWidget -> (?) -> Widget -> Observable -> RouteAware -> Subscribable -> EventAware -> MediaQueryAware -> Object
```

### Widget

At its core a widget class is attached to a single DOM element. It will hold a reference to that element, 
which can be accessed in your class via ```this.element```. Furthermore it should have a method with an arbitrary
name: ```@Template() myMarkup(templateName?: string): string```. This has to be called manually for the widget 
to render into its root element. This is usually done in the overridden method ```init(el: HTMLElement)```. 

However, feather does make assumption when to render the widget; it might be required to fetch data from 
the server or wait for other events to complete. To keep things simple the content of a widget's
@Template decorated method is appended to the root element. If a widget is not added to an array, templates
can return several root-nodes (this differs a bit from *React* with jsx for example).  
 
A widget usually comes with a ```@Construct({selector: string, ...})``` class decorator, which defines which 
HTML elements the component will be appended to. Once the Widget has been created, you can override the 
```init(element: HTMLElement)``` method in your class and call this.render(templateName) there. 

{{< note title="Note" >}}
Widgets don't require a constructor and custom initialization should be done in the overwritten *init* 
method. An exception to this are array-widgets. Array widget are widgets that are pushed into an array
property of another widget. They differ in so far that they don't require a this.render() call nor must
they have a @Construct decorator.
{{< /note >}}

You can have different template generating methods in the same widget class and choose which one to run
when calling this.render(). For this use a specific template name in the @Template decorator and call
this.render(chosenName) accordingly.

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
             return (`
                Hello ${this.who}!                                    
             `)
         }
     }
 }
 ```
 
Call now ```feather.start()``` and your application will render itself into ```<body>```. 

## Widget tree
Widgets form internally a tree, whenever they are referenced in a template or pushed to 
a bound array property. However they do not align, according to the dom hierarchy in a template.
What that means is that all widgets in a template will have their parentWidget set to the
component creating the template and not the parent tag inside the template.

## Bindings
Bindings are links between a class property and a place inside the template method. They are
annotated by using double curly braces {{property.subproperty:method1:method2}}. Subproperties
can be used of the bound property is a hierarchical object. The path you bind to, will modify
the target object with setters and getters, so feather ts is aware of the changes within that
path. Also optional is the set of methods. Those are called transformers and can change the type 
of a bound property to something that can be rendered. For example you can covert Date objects
to localized strings. The methods must be defined on the class that holds the template - if 
you inherit a property value via bequeath. 
A special case are classes that are annotated as singletons via @Construct(). Their methods
are also available as a transformer function, regardless of their placement.  

## Passing arguments to widgets

If you need to pass data from a widget to its children (usually referenced in its template), there are 
several possibilities, but all of them are done via constructor arguments collected from their 
dom attributes.

### String attributes
 
The simplest one is using string attributes: ```<my-widget attr1="str1" attr2="str2">```. In your 
*MyWidget* class the @Construct decorator should have an attribute array defined like so 
```@Construct({selector: 'my-widget', attributes: ['attr1', 'attr2']})```. Additionally provide a 
constructor with the following signature: ```constructor(attr1: string, attr2: string) {```. 
The order of the attributes must match the constructor's arguments.

### Complex types

If you need to pass something else than strings to the widget you can use *single* curly braces to do this: 
```<my-widget attr1={true} attr2={2+2} attr={propertyName}>```. If the text between the curly braces matches 
a property name in the parent widget its value will be used instead.    

## Observable

Feather provides one-way data-binding, which means you can create *hooks* between the component's 
data and the DOM. Whenever the data changes your DOM will update accordingly. There are several hook types, 
which are explained below. Feather does not use a virtual dom, but it binds directly to native DOM 
modifiers. 
Hooks are basically class properties with a ```@Bind()``` decorator and depending on the property type a 
reference in the widget's template method, declared by double curly braces. You can add hooks to:

### Primitives

The above example is quite rudimentary and in order to change the variable ```who``` one would need 
to clear the root element and call ```render(...)``` again to see it. This is a little bit cumbersome and expensive, 
since the widget would then re-render the entire template and re-create any children referenced within. To avoid this 
you can decorate primitive members (currently only booleans, strings, numbers but also arrays) with a ```@Bind()``` 
decorator like this:

<script async src="//jsfiddle.net/phbw6sdj/1/embed/js,result/"></script>

Now whenever the value of ```who``` changes, the text node will update automatically. You can bind properties 
in 4 different places within the template and in combination with the property type only some of them make 
sense. Let's have a look:
 
 * ```<div class="right {{variable}} large">...</div>``` As a new class in the class attribute (only strings)
 * ```<div class="red" style="{{variable}}">...</div>``` Within an arbitrary attribute (only strings and booleans)
 * ```<div class="red" {{variable}}>...</div>``` As a property hook (booleans and arrays but no transformer methods)
 * ```<div class="red">Some {{variable}} text!</div>``` Within a text node (only strings)

{{< note title="Note" >}}
Note that any binding can convert booleans, numbers or arrays into strings. This is done but declaring a *transformer* 
function in the widget class. You can then bind it like this: ```<div class="{{variable:formatAsString}}">...</div>```
{{< /note >}}

### Booleans

Booleans are bound almost the same way as primitives, but there are a few shortcuts that can be used:
 
  * ```<div class="right {{variable}} large">...</div>``` 
     Not supported. Consider using a transformer function, must be declared on the same widget class which returns a string.  
  * ```<div class="red" style="{{variable}}">...</div>``` if variable is true the attribute will be set, if ```undefined``` removed
  * ```<div class="red" {{variable}}>...</div>``` Special shortcut where the attribute's name is same as the variable. This is 
  useful for attributes like *checked* or *hidden*
  * ```<div class="red">Some {{variable}} text!</div>``` Not supported, use a transformer function to convert to a string.

 
### Arrays

Array bindings are maybe the most important ones, since they allow to map list structures to dom child nodes. 
This can be used to render different application pages or different mobile/desktop representations of your components.

Array hooks can be placed in only one manner:

  First declare ```@Bind({}) variable: MyWidget = []``` which contains objects that &must* extend ```feather.core.Widget```.
  One can use any of the native array functions to modify the array, but you must not replace the array itself 
  as the bindings and hooks will be lost. Array.fill is unsupported, because the children cannot be duplicates of one other.
  Furthermore never set children directly ```array[2] = mywidget``` because the change will be missed.
  Read more about bindings in the decorator section. Make sure **not** to call this.render() in widgets that are inserted 
  to a bound array. 

  * ```<div class="red" {{variable}}>...</div>``` 
  
{{< note title="Attention" >}}
Please don't use the same children in two different array bindings. Since children are also widgets 
they must have one unique DOM element they attach to. Having the same child in different arrays, would 
simply move the element in the DOM instead of rendering it twice as would be expected.
{{< /note >}}

#### Filtered Arrays

When binding arrays with a transformer function ```{{myarray:transformerFn}}``` the result differs depending 
on the transformer's return type. If it returns a primitive type the binding behaves the same way it would 
when binding a primitive type (be aware that the framework will execute one "sniff" call to determine this). 
However, if the transformer returns a function, this will be used to filter the array and remove filtered out 
elements from the DOM. The returned function signature must be: 

```typescript
   transformer() {
      return (el: MyChildWidget) => boolean
   }
```

Check the [listFilter](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts#L79) in our sample application and
its [definition](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts#L40)

### Objects

There are no object bindings in feather. If you need subcomponents you should consider creating a 
new widget and add it via template tags or push it to a locally bound array.

There is however to possibility to *deep* bind properties. If a widget property is a complex object,
you can assign template hooks via object dot notation: ```<div>{{property.x.y.z}}</div>```. The root
object will internally be observed so whenever any of the internal values change the template hook
will be re-rendered (or the object itself for that matter). This also works in combination with inherited 
bindings ```(@Bind({bequeath: true})``` from parent widgets and transformers: 
```
<div>{{parentProperty.x.y.z:calculate}}</div>
```
Even though deep arrays are also observed, you cannot access its children properties with the dot notation.

{{< note title="Note" >}}
Don't confuse inherited properties as class inherited ones. For a child widget to access parent widget's
properties, the widget must be either added to a parent's widget array or referenced somewhere in the
template rendering hierarchy as a tag.
{{< /note >}}

## Imports

Feather doesn't use any module loaders, so the imports are written like this:

```typescript
module mypackage {

    import Widget       = feather.core.Widget
    import Construct    = feather.annotations.Construct

    @Construct({selector: 'body.my-app'})
    export class MyApplication extends Widget {
       ...
    }
```

Make sure the files are listed in correct order in your *tsconfig.json*. Since the goal is to keep everything 
minimal and blazing fast it is advised to compress all your app code into a single file. 
