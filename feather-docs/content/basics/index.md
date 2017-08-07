---
date: 2016-10-01T21:07:13+01:00
title: API Documentation
weight: 20
---

## Widgets

Your application will be a collection of classes that all extend feather's *Widget* class. The widget class itself inherits
other classes in the following order:

```
MyWidget -> Widget -> Observable -> RouteAware -> Subscribable -> EventAware -> MediaQueryAware -> Object
```

This might change if typescript or javascript gets a better way to create *mixins*. 

### Widget

At its core a widget class is attached to a single DOM element. It holds a reference to that element, which can be accessed
in your class via ```this.element```. Furthermore it exposes a method ```render(templateName: string)```, which has to be 
called manually for the widget to render into its element. Feather doesn't want to make assumption when to render the 
widget; it might be required to fetch data from a server or wait for other events first. 
 
A widget usually comes with a ```@Construct({selector: string})``` class decorator, which defines which HTML elements the 
component will be attached to. Once the Widget cas been created, you can override the ```init(element: HTMLElement)``` method 
in your class and call this.render(templateName) there. The templateName is defined via ```@Template()```, which should 
decorate a method which returns a string it should render. Note the widgets don't require a constructor, and most of the 
custom initialization should be done in the overwritten ```init``` method. An exception to this are array-widgets, but more 
on this later.

You can also have different templates in the same widget class and choose which way to render the widget's data.

Putting it all together, a very simple widget might look like this:
 
```
 module demo {
 
     import Widget    = feather.core.Widget
     import Construct = feather.annotations.Construct
     import Template  = feather.annotations.Template
 
     @Construct({selector: 'body'})
     export class MyApplication extends Widget {
 
         who = 'world'   
 
         init(element: HTMLElement) {
             this.render('default')
         }
 
         @Template('default')
         protected getBaseTemplate() {
             return (`
                Hello ${this.who}!                                    
             `)
         }
     }
 }
 ```
 
Call then ```feather.start()``` and your application should render itself into ```<body>```. 

## Passing arguments to widgets

If you need to pass data from a widget to its children (usually referenced in its template), there are several possibilities. The simplest
one is using string attributes: ```<my-widget attr1="str1" attr2="str2">```. In your *MyWidget* class the @Construct decorator should have then an attribute 
array defined like so ```@Construct({selector: 'my-widget', attributes: ['attr1', 'attr2']})```. Additionally provide a constructor with 
the following signature: ```constructor(attr1: string, attr2: string) {```. The order of the attribute array must match the constructor arguments.

If you need to pass other types than *strings* to the constructor you can use single curly brackets to do this: ```<my-widget attr1={true} attr2={2+2}>``` 
and so on. If the text between the curly brackets matches a property name in the parent widget its value will be used instead.    

## Observable

Feather provides one-way data-binding, which means you can create *hooks* between the component's data and the DOM. Whenever the data changes,
your DOM will update accordingly. There are several hook types, which are explained below. Feather does not use a virtual dom, but it binds directly to 
native DOM modifiers which makes it even faster than any of the virtual dom based frameworks out there. Hooks are basically widget properties with 
a @Bind() decorator and depending on the property type a reference in the widget's template method, declared by double curly brackets.

### Primitives

The above example is quite rudimentary and if you wanted to change the variable ```who``` you would need to call ```render(...)``` again to see it.
This is a little bit cumbersome and expensive, since the widget would then re-render the entire template with any children referenced within. To 
avoid this you can decorate primitive members (currently only booleans, strings, numbers but also arrays) with ```@Bind()``` like this:

<script async src="//jsfiddle.net/phbw6sdj/1/embed/js,result/"></script>

Now whenever the value of ```who``` changes, the text node will update automatically. You can bind variables in 4 different places within 
a dom tree and in combation with the variable type, only some of them make sense. The hooks can be inserted in these ways:
 
 * ```<div class="right {{variable}} large">...</div>``` As a new class in the class attribute (only strings)
 * ```<div class="red" style="{{variable}}">...</div>``` Within an arbitrary attribute (only strings and booleans)
 * ```<div class="red" {{variable}}>...</div>``` As a property hook (booleans and arrays)
 * ```<div class="red">Some {{variable}} text!</div>``` Within a text node (only strings)

{{< note title="Note" >}}
Note that any binding can convert booleans, numbers or arrays into strings. This is done but declaring a *transformer* function in the widget 
class. you can then bind it like this: ```<div class="{{variable:formatAsString}}">...</div>```
{{< /note >}}

### Booleans

Booleans are bound almost the same way as primitives, but there are a few shortcuts that can be used:
 
  * ```<div class="right {{variable}} large">...</div>``` 
     Not supported, consider using a transformer function, declared on the same widget, which returns a string.  
  * ```<div class="red" style="{{variable}}">...</div>``` is variable is true the attribute will be set, otherwise removed
  * ```<div class="red" {{variable}}>...</div>``` Special shortcut where the attributes name is same as the variable. This is 
  useful for attributes like *checked* or *hidden*
  * ```<div class="red">Some {{variable}} text!</div>``` Not supported

 
### Arrays

Array bindings are the maybe the most important ones, since they allow you map list structures to dom nodes. They can be also
used to render different application pages or with transformer functions different mobile/desktop representations of components.

Array hooks can be placed in only one manner:

  First declare ```@Bind({}) variable: MyWidget = []``` which contains objects that **must** extend ```Widget```. You can use
  any of the native array functions to modify the array, but you must not replace the array itself as the bindings and hooks 
  will be lost. Read more about bindings in the decorator section. 

  * ```<div class="red" {{variable}}>...</div>``` 
  
{{< note title="Note" >}}
Please don't use the same children in two different array bindings. Since children are also Widgets they must have one unique DOM
element they attach to. Having the same child in different arrays, would simply move the element's DOM position instead of rendering
it twice as expected.
{{< /note >}}


### Objects

There are no object bindings in feather. If you need subcomponents you should consider creating a new ```Widget``` and add it via template 
strings to you parent component.

## Imports

Feather doesn't use any module loaders, so the imports are written like this:

```
module mypackage {

    import Widget       = feather.core.Widget
    import Construct    = feather.annotations.Construct

    @Construct({selector: 'body.my-app'})
    export class MyApplication extends Widget {
       ...
    }
```

Make sure the files are listed in correct order in your *tsconfig.json*. Since the goal is to keep everything minimal it is advised to
compress all your app code into one file. 

