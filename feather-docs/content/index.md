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
between components, but foremost the framework is so lightweight, that your build times will be instantaneous 
and no server-side rendering is required because the whole application bootstraps in under 200ms.

Feel free to compare the performance and code readability of our todomvc app (link below) to other frameworks.  

The framework offers the following features:

* Each component is holding logic, view and model in a single file
* Components automatically build a hierarchical tree
* Message hub between components
* Easy REST consumption
* Routing via hash or history API 
* Very flat learning curve due
* Logicless templates in pure HTML with very simple binding syntax
* Event delegation out of the box
* Written in TypeScript
* No module loaders needed, embed directly via NPM
* With aynchronous decorators no need for _promises_
* Integrated media query based component views
* Support for modern browsers including IE9
* The initial component hierarchy is created with a document fragment for maximum bootstrap speed.
  
Intellij IDEA [plugin](http://dist.feather-ts.com/feather.jar) for syntax highlighting in templates
  
You can checkout a todomvc demo [here](http://todo.feather-ts.com).
  
{{< note title="Note" >}}
This project is in its infancy, so if you want something production ready, you
should probably check out react, angular or any of the myriad of MVC frameworks out there with way
better documenation and community support than feather will ever have.
{{< /note >}}

