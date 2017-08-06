---
date: 2017-08-06T21:07:13+01:00
title: Decorators
weight: 30
---

Feather provides a bunch of decorators to add functionality to your components. However most of 
them decorate instances instead the classes. This is done internally with a few tricks, but you
should remember this difference when writing components.

## @Bind(...)

Allows to bind component data to DOM hooks, which will update your UI whenever the underlying data
changes.

```
  @Bind({
      templateName?: string   
      changeOn?: string[] 
      localStorage?: boolean
      html?: boolean
  })
```

### templateName 
  This is used with array bindings and specifies which template method should 
  be used in the child widget class to render its children. If no name is used it defaults to
  the method that is decorated with no-arg @Template()
  
  **Note that child widget should not
  call this.render() in the init method, since the framework will take care of this.**  
  
  Here an example:

```
  class Parent extends Widget {
    @Bind({}) myArray: Child[] = []
    @Bind({templateName: 'alternative'}) myOtherArray: Child[] = []
    
    init() {
      this.render()
    }
    
    @Template()
    markup() {
      <uL {{myArray}}></ul>
      <uL {{myOtherArray}}></ul>
    }
  }
  
  class Child extends Widget {
  
    @Template()
    markupOne() {
      return <li>A</li>
    }    
  
    @Template('alternative')
    markupTwo() {
      return <li>B</li>
    }    
  
  }
```

### changeOn

This is also used exclusively with array bindings and will trigger all template hooks to be re-evaluated. 
Especially useful when you have transformers that reduce the array to a string or filter the array. 

```
  class Parent extends Widget {
    @Bind({changeOn: ['state']}) myArray: Child[] = []
    @Bind() state = true
    
    init() {
      this.render()
    }
    
    @Template()
    markup() {
      <ul {{myArray:filter}}></ul>
    }
    
    filter() {
      return (el: Child) => this.state
    }
  } 
```

Now if you change *state* the ```<ul>``` tag will show or hide its child widgets.

### localStorage

This boolean will initialize a binding from *localstorage*. With array bindings, however, you must define 
```@Read(arrayProperty: string)``` and ```@Write(arrayProperty: string)``` serializers for its children. 
This is best explained in the following [source file](https://github.com/mendrik/feather-todo/blob/master/ts/todo-list.ts)
Primitives are stored without any serializers. The local storage name is calculated from the widgets
path (resolved through parentWidgets). Each path segment is taken from a property called id, name, title or
a function named like this. If no are present the widgets class name is taken.

### html

With string bindings you might sometimes want to inject unescaped html fragments into the dom tree. The only
restriction is that you cannot inject it a template's root node. This is experimental, so use carefully.

## @On()

```
  @On({
    event: string 
    scope?: Scope
    selector?: string
    preventDefault?: boolean
    bubble?: boolean
  })
```

### event
### scope
### selector
### preventDefault
### bubble

## @Media

```
  @Media('(min-width: 600px)')
```

## @Route

```
  @Route('/:path')
```

## @Subscribe

```
  @Subscribe('my-event')
```

## @Template

```
  @Template(name: string, warmUp: boolean)
```

## @Rest

```
  @Rest({
    url:              string
    method?:          MethodValue
    timeout?:         number
    async?:           boolean
    responseFilter?:  (data: string) => any
    requestFilter?:   (data: string) => any
    progress?:        (ev: ProgressEvent) => any
    withCredentials?: boolean
    body?:            string
    headers?:         TypedMap<string|StringFactory>
  })
```

