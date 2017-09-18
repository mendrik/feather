---
date: 2016-02-01T21:07:13+01:00
title: Documentation
---

Feather provides a set of decorators to add functionality to your components. However, most of 
them decorate the instances and not the classes, which is typescript's default behaviour. 
This is achieved internally with a few tricks, but you should remember that difference when writing 
components. 
Furthermore you cannot use *this* in the decorator's arguments, because the instance does not yet
exists when the decorator function is executed. Feather just stores the blueprint of it and evaluates it
when a widget is actually created. 
The decorators that need access to instance properties refer to those via name or template strings 
within double braces.

## @Construct <span>(feather.annotations)</span>

This is the only true *class* decorator and defines foremost how to create a widget and where 
to attach it to. Only widgets that are pushed into an array of another widget don't need this decorator.

```
  @Construct({
    selector: string
    attributes?: string[]
    singleton?: boolean
  })
```

### selector

The css selector that creates a new component; can be used either on the document level or inside a template.

### attributes

A list of attributes that should be collected and passed on to the widget's constructor. Make sure the
order matches the constructor's arguments. 

```
<my-component attr1="val1" attr2={true} attr3={parentProp}/>
```
passes attributes like this - presuming parentProp is of ComplexType:
```
@Construct({selector: 'my-component', attributes: ['att1','attr2','att3']})
class MyComponent extends Widget {
  constructor(attr1: string, attr2: boolean, attr3: ComplexType) {
    super()
  }
}

```
 

### singleton

A boolean marker that can marks this widget as a singleton. Can be used with ```this.triggerSingleton()```. 
See more under [@Subscribe](/documentation/#subscribe). 
Singletons are additionally in so far special that transformer methods can reference those. This is useful
if you want to define a "global" localization method in a high-up singleton component, that serves translated keys
to other components. 
The runtime singleton set can be accessed manually under `feather.boot.WidgetFactory.singletonRegistry` 

## @Bind <span>(feather.observe)</span>

Allows to bind component properties to the DOM which will update your UI whenever the bound property 
changes. 

```
  @Bind({
      templateName?: string,   
      localStorage?: boolean,
      html?: boolean,
      bequeath?: boolean,
      affectsArrays?: string
  })
```

### templateName 
This is used with array bindings and specifies which template should be used to render the children with. 
If no name is given it defaults to the method that is decorated with no arguments inside of `@Template()`.
  
Here an example:

```typescript
  import Widget = feather.core.Widget
  import Bind = feather.observe.Bind
  import Template = feather.annotations.Template

  class Parent extends Widget {
    @Bind() myArray: Child[] = []
    @Bind({templateName: 'alternative'}) myOtherArray: Child[] = []
    
    init() {
      this.render()
    }
    
    @Template()
    markup() {
      return `<uL {{myArray}}></ul>
              <uL {{myOtherArray}}></ul>`
    }
  }
  
  class Child extends Widget {
  
    @Template()
    markupOne() {
      return `<li>A</li>`
    }    
  
    @Template('alternative')
    markupTwo() {
      return `<li>B</li>`
    }    
  }
```

> Note that child widgets in an array should not call ```this.render()``` in the init method, since the 
> framework will take care of it. However, you can still use the init method for other bootstrapping logic. 

### localStorage

This boolean will initialize a widget property from *localStorage*. With array bindings, however, you must define 
`@Read(arrayProperty: string)` and `@Write(arrayProperty: string)` serializers for its children. 
This is best explained in the following [source file](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts). 
Primitives are stored without any serializers. The local storage name is calculated from the widgets
path, resolved through parent widgets. Each path segment is taken from a property called id, name, title or
a function named equally. If none are present the widget's class name is taken. Make sure the path segments 
are unique for each widget instance. 

Local storage serialization is executed after a timeout to not block the rendering queue. Currently the delay is
set to 80ms.

### bequeath

If set to true, this property can be bound in templates further down in the component tree. This is an easy
way to render parent properties in child components without having to rely on @Subscribe to pass around data
in your application.

### affectsArrays

If you want array bindings to update whenever another property changes, because they change ie. filter states, 
insert the array name to this property `@Bind({affectsArrays: ['filteredArray']) filterState = ...`

### html

When set to true the property will be injected as unescaped html. The injected html doesn't have to have a single
root node. Feather will keep track of cleaning up multiple root nodes automatically. For example you can inject 
some text with an email link without the need to wrap the whole message in a `<div>`.

## @On <span>(feather.event)</span>

With this decorator you can add event listeners to the root element of a widget. The event handling is done through 
delegation. Event bubbling stops at the root element. If you need to bubble events further up you must set *bubble* 
to true. However if no widgets are in between, you can listen to events triggered way at the bottom of the dom tree.

```
  @On({
    event: string, 
    scope?: Scope,
    selector?: string,
    preventDefault?: boolean,
    bubble?: boolean
  })
```

### event

The DOM event to listen to. A list of dom events can be found [here](https://developer.mozilla.org/en-US/docs/Web/Events).
You can listen to multiple events by separating them with spaces.

### scope

Scope can be either `feather.event.Scope.Direct` or `feather.event.Scope.Delegate`. If set to `Scope.Direct` the event 
listener is attached directly to the first element that matches the selector inside the rendered template. This is
useful for events that don't bubble.

### selector

The selector that must match the event target for the delegated event to trigger.

### preventDefault

Small helper if you want to avoid calling `ev.preventDefault()` yourself. Same as: 
```
  @On({event: 'click'})
  click(ev: MouseEvent) {
    ev.preventDefault()
    ...
  }
```

### bubble

If set to true it will bubble this dom event beyond the widget's root element. Feather stops event propagation
by default at the root, so it is possible to have nested Widgets of the same class and scope their events accordingly. 

> You can also use own event extensions to define gestures. This is quite advanced but an example is 
> [available here](https://github.com/mendrik/feather-components/blob/master/src/common/events.ts)  

## @Media <span>(feather.media)</span>

```
  @Media('(min-width: 600px)')
```

Triggers the method if the specified media query matches. This can be used to run different logic for different
viewport sizes. You could for example set a viewport state and filter an array binding with different components.
See @Bind/affectsArray for more info. The method is called initially if matched but also when the viewport size changes.
This way you don't need to utilize resize or orientationchange events at all.

## @Route <span>(feather.routing)</span>

Triggers when the route matches the current location. Feather supports hash based urls but also HTML5's 
history API. If you want to enable hash based routing add an attribute `routing="hash"` anywhere in your
document. For example `<html routing="hash">`

```
  @Route('/:path')
```

Route parsing is very basic and supports only :path and *path tokens. The called method is passed an object
where the properties correspond to the named tokens in the route:

```
  interface MyRoute {
    path: string
    id: string
  }  
  ....
  @Route('/:path/:id')
  locationPath(route: MyRoute) {
    // ...
  }
```

When using historyAPI make sure all your document urls load the original document on the server-side. Unlike
with hash routing links must be intercepted and manually routed. One can do this easily with a small widget:

```
// modify the selector to be more strict if needed
@Contruct({selector: 'a:not([href^="http://"])'}) 
class RoutingLink extends Widget {

  @On({event: 'click', preventDefault: true})
  click(ev: MouseEvent, a: HTMLAnchorElement) {
     this.route(a.getAttribute('href'))        
  }
  
}
```

## @Subscribe <span>(feather.hub)</span>

Subscribe to component events. Events can be broadcasted either up or down the widget's hierarchy. A widget
object has always an array `childWidgets` and an optional `parentWidget` reference. 
With `this.triggerUp('my-event', data)` you can notify decorated methods in parent widgets and with 
`this.triggeDown('my-event', data)` accordingly all children. This also propagates into arrays.

A special case are singletons that can be notified via `this.triggerSingleton('my-event', data)`. For this
to work you must set the `singleton` property to true in @Construct(). Make sure you create only one 
instance of this widget otherwise you might encounter unpredicted side effects. 

```
  @Subscribe('my-event')
```

## @Template <span>(feather.annotations)</span>

```
  @Template(name?: string, warmUp?: boolean)
```

Decorates methods that return html as a simple string to render the widget. You can have multiple templates 
per widget, if you need to display it in different ways. If the name parameter is missing it 
is set to 'default'. Then you can use `this.render()` without any arguments otherwise call this.render(name)
with the name being set to match the `@Template(name)` decorator. 

Note that template methods must be real methods and not arrow function.


## @Rest <span>(feather.xhr)</span>

```
  @Rest({
    url:              string,
    method?:          MethodValue,
    timeout?:         number,
    async?:           boolean,
    responseFilter?:  (data: string) => any,
    requestFilter?:   (data: string) => any,
    progress?:        (ev: ProgressEvent) => any,
    withCredentials?: boolean,
    body?:            string,
    headers?:         TypedMap<string|StringFactory>
  })
```

If your application consumes REST APIs this will allow you to receive data to your components. Most of the 
parameters above are already preset for json based APIs. Let's have a look at a simple example:

```typescript
  import Rest = feather.xhr.Rest
  import Widget = feather.core.Widget

  class Parent extends Widget {
    
    projectId : number
    
    init() {
      this.projectId = 10
      this.fetchProject()
    }
    
    @Rest({url: '/projects/{{projectId}}'})
    fetchProject(project?: Project) {
    }
  } 
```

The default *Method* is *GET* and the accept-headers are set to json/application. To avoid errors in the
typescript compiler the project argument is optional, because it works so that ```this.fetchProject()```
will make the http request and call the method with the received data. To catch request failures subscribe
to xhr failure events:

```
  @Subscribe('xhr-failure-401')
  unauthorized() {
    this.route('/login')
  }
```

Change the status code accordingly. Apart from non 2** and 3** status errors, feather fires also 
xhr-failure-cancel, xhr-failure-abort, xhr-failure-timeout if those occur. 

### url

The url to make the request to. As one can see the url can contain properties from the widget to allow 
dynamic requests.

### method

From feather.xhr.Method:
```
  export const Method = {
      GET:    'GET'    as MethodValue,
      POST:   'POST'   as MethodValue,
      DELETE: 'DELETE' as MethodValue,
      PUT:    'PUT'    as MethodValue
  }
```

### timeout

Override the default xhr request timeout value in milliseconds.

### progress

A progress listener can be handled via
 
```
@Subscribe('xhr-progress')
onProgress(ev: ProgressEvent) {
  ...
}
```

### body

When using Method.POST one might want to post a request load to the server: declare a widget
property which will be automatically serialized to JSON and posted. You can also use parts 
of the referenced object with dot notation ie: 'data.x'

```typescript


  class Parent extends Widget {
    
    projectId : 5
    data: {
      name: 'data'
    }
    
    init() {
      this.postProject()
    }
    
    @Rest({url: '/projects/{{projectId}}', method: Method.POST, body: 'data'})
    postProject(project?: Project) {
    }
  } 
```

### headers

If one needs to add custom headers to the request one can use it like so:

```
  export const headers: TypedMap<string|StringFactory> = {
      'X-Api-Key': 'AbCdEfGhIjK1',
      'Content-Type': 'application/json',
      'Accept-Language': 'en_IE.UTF-8',
      [AUTH_HEADER]: 'xy'
  }

  ...
  @Rest({url: '/translations', headers: mypackage.headers})
  fetchTranslations(translations?: Messages) {
      ...
  }
```

> More information can be found directly from the source code of feather-ts. Check it out on github either from 
> the [framework](https://github.com/mendrik/feather) or the [UI components](https://github.com/mendrik/feather-components). 

# Writing your own decorators

You can also write your own decorators like `@Debounce` or `@AnimationFrame` for example. Just checkout the 
source code of feather in github to get an idea how this can be done. 
