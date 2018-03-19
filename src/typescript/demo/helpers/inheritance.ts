module demo {

    import Widget    = feather.core.Widget
    import Construct = feather.annotations.Construct
    import Template  = feather.annotations.Template
    import Bind      = feather.observe.Bind
    import Write     = feather.observe.Write
    import Read      = feather.observe.Read

    export interface Person {
        name: string
        noChange?: string
        siblings?: Person[]
        mother?: Person
    }

    export interface StoredPerson {
        name: string
    }

    @Construct({selector: 'Inheritance'})
    export class Inheritance extends Widget {

        @Bind() person: Person
        @Bind({localStorage: true}) people: Person[] = []
        @Bind({templateName: 'minimal'}) elements: ArrayElement[] = []

        @Bind() styles = {
            color: 'red',
            borderWidth: '1px'
        }

        constructor() {
            super()
            window['inh'] = this
        }

        init() {
            const mother = {
                name: 'Michaela',
                siblings: [{name: 'Piotr'}]
            }
            this.person = {
                name: 'Andreas',
                noChange: 'don\'t change',
                siblings: [{name: 'Peter', mother: mother}, {name: 'Ella', mother: mother}],
                mother: mother
            }
            this.render('default')
        }

        @Template()
        protected getBaseTemplate() {
            return (`
                <div id="inherit" style="{{styles}}" test="{{inheritedString}}" length="{{filteredList:sizeOfArray}}" people="{{people:sizeOfArray}}">
                    <span uncles={{person.mother.siblings:sizeOfArray}}>{{inheritedString}}</span>
                    <div id="person"
                         siblingsLength={{person.siblings:sizeOfArray}}
                         uncles={{person.mother.siblings:sizeOfArray}}>{{person.name}}</div>
                    <div id="mother"
                         uppercase="{{person.mother.name:uppercase}}"
                         uppercaseMothersName="{{person:uppercaseMothersName}}">{{person.mother.name}}</div>
                    <div id="sibling-names">{{person.siblings:names}}</div>
                    <div id="aunt"
                         uppercase="{{aunt.mother.name:uppercase}}"
                         uppercaseMothersName="{{aunt:uppercaseMothersName}}">{{person.mother.name}}</div>
                    <div id="inherited-object" fullName={{inheritedObject:fullname}}>
                        {{inheritedObject.fullname.name}} {{inheritedObject.fullname.surname}}
                    </div>
                    <ul {{elements}}></ul>
                    <EventListener children="{2}"/>
                    <Computed/>
                </div>
            `)
        }

        @Write('people') write = (person: Person): StoredPerson => ({name: person.name})
        @Read('people') read = (stored: StoredPerson): Person => ({name: stored.name})

        uppercase = (name: string) => name.toUpperCase()
        uppercaseMothersName = (person: Person) => person.mother.name.toUpperCase()
        sizeOfArray = (arr: any[]) => `${arr.length}`
        names = (arr: Person[]) => `${arr.map(p => p.name).join(', ')}`
        fullname = (obj: any) => `${obj.fullname.name} ${obj.fullname.surname}`
    }
}
