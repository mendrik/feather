---
date: 2017-08-06T21:07:13+01:00
title: Decorators
weight: 30
---

## Decorators

Feather provides a bunch of decorators to add functionality to your components. However most of 
them decorate instances instead the classes. This is done internally with a few tricks, but you
should remember this difference when writing components.

### @Bind(...)

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

####templateName 
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

####changeOn

 
