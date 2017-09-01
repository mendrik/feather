---
date: 2016-09-29T21:07:13+01:00
title: Introduction
type: index
weight: 0
---

Featherₜₛ is a small component framework written in [TypeScript](https://www.typescriptlang.org/). 
Whether you are writing embeddable javascript widgets or a single page application this framework 
might be of use. With less than 10kb in size it is suited for mobile apps and desktop alike.

With this framework you will be able to write natural code without too many dogmatic aspects. 
There is no hidden mess of global state objects, action constants, no hard to follow data messaging 
between components but foremost the framework is so lightweight that your build times will be instantaneous 
and because of its speed no server-side rendering is required.

The framework offers the following features:

* Each component is holding logic, view and model in a single file
* Components automatically build a hierarchical tree
* Message hub between components and singletons
* Easy REST consumption
* Routing via hash or history API 
* Pure HTML templates without logic and a very simple binding syntax
* Event delegation out of the box
* Written in TypeScript
* No module loaders, needed embed directly via NPM
* With asynchronous decorators no need for _promises_
* Integrated media query based component views for responsive application design
* Support for modern browsers including IE9 (with polyfills)
* Component trees are initialized in off-screen document fragments for maximum performance.
* Access to up-tree properties without repetitive property clutter
* Generates clean HTML markup without any trace of the framework
* No wrappers required for your data holders
  
Intellij IDEA [plugin](http://dist.feather-ts.com/feather.jar) for syntax highlighting in templates 
and decorators.
  
You can checkout a todomvc demo [here](http://todo.feather-ts.com).
  
{{< note title="Note" >}}
This project is in now in alpha and you can use it in private projects if you wish. However if you need 
something more production or enterprise ready, you should probably check out one of the a many javascript 
frameworks out there.
{{< /note >}}

