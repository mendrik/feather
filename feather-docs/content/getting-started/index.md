---
date: 2016-09-30T21:07:13+01:00
title: Getting started
weight: 10
---

## Installing Featherₜₛ

```
npm install feather-ts --save
```

Create a **tsconfig.json** file in your project's root containing the following settings. Since decorators are the beef of it all 
make sure they are enabled. Feather.js embeds the typescript emitted [helpers](https://github.com/Microsoft/tslib) so one can disable them.

```typescript
{
    ...
    "compilerOptions": {
         ...
        "experimentalDecorators": true,
        "target": "es5",
        ...  
        "types": [
            "es6-shim",
            "feather-ts",
            ...
        ],
        "typeRoots": [
            "node_modules/@types"
        ]
    },
    "files": [
        ... 
    ]
}
```

Then write your widgets and include the output together with feather.min.js (in node_modules) in your page.
After the DOM and the scripts have been loaded make the following call to bootstrap the widgets and and routes. 

```
feather.start();
```

## A widget's anatomy

To get an impression of the code style you will be dealing with here is an example. As you can see the code is
very compact and flat.

```typescript
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
are optional however they can convert values to other types, i.e. booleans to "yes" / "no" strings or filter arrays before rendering.
In some cases the variable can also reference deep properties with object dot notation. 
{{< /note >}}
