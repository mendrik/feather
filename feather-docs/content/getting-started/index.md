---
date: 2016-09-30T21:07:13+01:00
title: Getting started
weight: 10
---

## Installing Featherₜₛ

Installing [typescript](https://github.com/Microsoft/TypeScript) and [typings](https://github.com/typings/typings) globally is recommended, if not yet present. Then run the following commands to add featherₜₛ as a 
local dependency. 

```
npm install feather-ts --save
typings install npm:feather-ts -G --save
```

Create a **tsconfig.json** file in your project's root containing the following settings. ES6 output is currently not supported and 
since decorators are the beef of it all make sure they are enabled. Feather.js embeds the typescript emitted helpers so you can disable 
them if you wish.

```
{
  "compilerOptions": {
    ...
	"target": "es5", 
	"experimentalDecorators": true, 
	...
  },
  "files": [
	<your-source-files>
  ],
  "exclude": [
    ...
	"node_modules",
	"typings"
	...
  ]
}
```

Then write your widgets and include the output together with feather.js (from node_modules) in your page.
After the DOM and the scripts have been loaded make the following call; it will bootstrap the widgets and route listeners. 

```
feather.start();
```

## A widget's anatomy

To get an impression of the code style you will be dealing with, here is a sample widget code. As you can see the code is
very compact and flat.

```
/// <reference path="../typings/index.d.ts"/>    /* feather typings */

module todomvc.feather {

    import Widget          = feather.core.Widget /* imports of referenced components */
    ...
    
    @Construct({selector: '.todoapp'}) /* the selector to bind this widget to */
    class TodoList extends Widget {    /* all widgets must extend Widget */

        @Bind() state = ListState.ALL  /* prefix members that auto update DOM with @Bind(), supported are booleans, strings and numbers */

        @Bind({templateName: 'default', changeOn: ['state']}) /* arrays are a special case, more about the params later */
        todos: Todo[] = []
        
        /* no constructor is required */

        init(element: HTMLElement) {   /* whenever a widget is fully initialized it calls init() */
            this.getData()
        }
        
        @Fetch('/api/todos')           /* fetch data from a REST api and render the widget */
        getData(data?: Todo[]) {
            this.todos.push.apply(this.todos, data)
            this.render('default')     /* if you're not loading data you can render() already in init() */
        }

        @Subscribe('create-todo')      /* listen to messages from parent or child widgets via @Subscribe */
        newTodo(todo: Todo) {
            this.todos.push(todo)
        }

        @Route('/:path')               /* listen to route changes with @Route */
        locationPath(params: SimpleMap) {
            if (params['path'] === 'active') {
                ...
            }
        }

        @On({event: 'click', selector: '.clear-completed', preventDefault: true}) /* attach DOM events via @On */
        clearCompleted() {
            ...
        }

        @Template('default') /* widgets can be rendered with different templates */
        toHtml() { /* use ES6 template strings to define HTML snippets */
            return (`
              ...
              <ul class="todo-list" {{todos:listFilter}}></ul>
              <button class="clear-completed" hidden="{{todos:noCompleted}}">Clear completed</button>
              ...
            `)
        }
    }
}
```

See the full todo app in action [here](http://todo.feather-ts.com/). Take a peek at the typescript source maps, too.

{{< note title="Note" >}}
The bindings in the HTML code are very simple. The only extra syntax on top of regular HTML is {{variable:methodA:methodB}}. Methods 
are optional however they can convert values to other types, ie boolean to "yes" / "no" strings, or filter arrays before rendering.
 
The above code is stripped off large parts, so don't expect it to compile or run.
{{< /note >}}
