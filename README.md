# sUTL-spec
The specification for sUTL Universal Transform Language, v0.3

[Try the online editor here!](http://emlynoregan.github.io/sUTL_js/)

[Javascript implementation here!](https://github.com/emlynoregan/sUTL_js)
[Python implementation here!](https://github.com/emlynoregan/sUTL_py)

sUTL is a Lisp dialect that is specified in and operates natively on MAS structures (Maps/Dicts, Arrays/Lists, Simple Types including String, Number, Boolean and null) in a host language. MAS structures are defined as exactly those which successfully serialise to JSON and deserialise from JSON, so JSON is a convenient way to think about MAS. However, it is important to remember that MAS is not JSON; it is the territory to JSON's map.

The primary purpose of sUTL is to be a universal transform tool that operates across many languages; whether you use Python, Javascript, Java, etc, you should be able to use sUTL transforms. As the library of well tested transforms grows, they can potentially be easily accessible in any host language, and should always evaluate identically regardless of the host environment chosen.

## Contents

- [MAS](#mas)
- [Transforms](#transforms)
- [Declarations](#declarations)
- [Naming](#naming)
- [Distribution](#distribution)
- [Grammar](#grammar)
- [Functions](#basic-functions-of-sutl)
- - [evaluate](#evaluate)
- - [compilelib](#compilelib)
- [Assembling The Distributions](#assembling-the-distributions)
- [Builtins](#builtins)
- - [path](#path)
- - [if](#if)
- - [keys](#keys)
- - [values](#values)
- - [type](#type)
- - [makemap](#makemap)
- - [binary arithmetic operators](#binary-arithmetic-operators)
- - [equality operators](#equality-operators)
- - [comparison operators](#comparison-operators)
- - [logical operators](#logical-operators)
- [Core](#core)
- - [map](#map)
- - [reduce](#reduce)
- - [reverse](#reverse)
- - [head](#head-tail-front-last)
- - [tail](#head-tail-front-last)
- - [front](#head-tail-front-last)
- - [last](#head-tail-front-last)
- - [concat](#concat)
- - [removenulls](#removenulls)
- - [count](#count)
- - [sum](#sum)
- - [zip](#zip)
- - [addmaps](#addmaps)
- - [removekeys](#removekeys)
- - [mapget](#mapget)
- - [keys2map](#keys2map)
- - [filter](#filter)
- - [isinlist](#isinlist)
- - [subtractarrs](#subtractarrs)

## MAS
MAS has been chosen because analogues are available in most computer languages, particularly the dynamic languages (javascript, python, perl, ...), and these analogues are often fundamental data structures in the host language, meaning the host language can be very expressive when dealing with these structures, and large parts of the host language tend to deal exclusively in these structures. This makes sUTL live very comfortably inside these languages, and minimises impedence mismatches at the interface between sUTL and its hosts.

## Transforms
sUTL is not strictly a functional language, in that its fundamental unit is a Transform rather than a Function. A Transform is conceptually more like what languages such as XSLT, Mustache, Smarty, and Jinja deal in, but in expressive power it is at least as powerful as non-lazy higher order dynamic language functions and shares many characteristics with them. 

It is perfectly possible to reason about sUTL transforms by drawing the analogy to Lisp functions, and most theory from the lambda calculus, the various Lisps, and functions in general can be transferred to transforms. 

For concrete examples of what transforms are, try the following:
- [Transforming Tweets with sUTL](https://medium.com/@emlynoregan/transforming-tweets-with-sutl-1567663c322d) is a simple introduction to Transforms.
- The [core library distribution](http://emlynoregan.github.io/sUTL-spec/sUTL_core.json) is a list of declarations; check out the Transforms there for some advanced examples.

## Declarations
Transforms in sUTL don't have any kind of contract with callers, except what might be gleaned by analysing their details. 

Declarations are a wrapper around a transform, and are analogous to a mix of a function signature and a package manifest.

A declaration is a dictionary that includes a main transform, and some optional additional information. It can be thought of as a function signature, an interface, or a contract. 

eg:

    {
        "name": "addone",
        "transform-t": 
        {
          "!": "#*.map",
          "list": "#@list",
          "t": {"'": {
              "&": "+",
              "a": "#@.item",
              "b": 1
          }}
        },
        "requires": ["map"]
    }

The attributes of the declaration include:
- "name": A name for other declarations to use when requiring this declaration.
- "transform-t": This is the main transform, ie: the actual transform being declared. Required.
- "requires": This is a list of declaration names. These describe the declared transforms (declarations) that are expected to be in the library when the main transform is evaluated. Optional.
- "test-t": This is a special transform, which can be used to test the transform "transform-t". When evaluated on "transform-t" as its source, it is falsey if the test succeeds, or truthy if it fails. A convention is that a failed (truthy) result should be a list of strings, describing what failures occured in the test. See the function compilelib() below for details on how these tests can be invoked.

With further regard to tests, you will note that there is no specification of versioning in Declarations, or in "requires" sections. However, it is intended that many uses of sUTL will involve pulling declarations of functions from websites at run time or whenever desired. This means that a transform written to expect a particular library transform, say A, can receive a modified version, say A', at a later time. There are no guarantees that A is in any way similar to A'.

Instead of using versioning to address this concern, sUTL uses tests to allow a transform author to apply acceptance tests to their required library transforms. That is, if you are worried that a required transform A might change on you, you can write your test-t to include acceptance testing of A as well as unit testing on yourself.

Also note that if you want to separate the concerns of acceptance testing a required transform from testing your own transform, you can write the acceptance tests as part of a separate, "testing" transform, and require it in your own transform. Separated like this, you can also consume someone else's test transforms rather than writing your own.

### Naming
To be publishable, ie: to be able to be required by another transform, the declaration must include a name. This is a structured string, which should include naming from most specific to most general, separated by underscores. eg: "map_core_emlynoregan_com"
In a "requires" list, a requirement matches the first declaration it finds where the require name is equal to or is a prefix of the declaration's name.

eg: A requirement of "map_core" would match a declaration name of "map_core_emlynoregan_com", but it would also match "map_core_mock". This construct should allow dependency injection semantics to be achieved.

A recommmended convention is that all of your declaration names should have a final element which is a domain name you own, eg: "emlynoregan.com". This acts as a namespace separating your transforms from those of others. 

## Distribution
A distribution is an ordered list of declarations. The ordering allows a light versioning; a particular distribution could contain a number of transforms with the same name. Consumers are able to just grab the latest, or grab the first one of a given name that passes their tests (very powerful, because it lets you release new versions of a transform without breaking old dependent transforms which rely on deprecated behavior), or other approaches as desired. 

## Grammar

In this grammar, the fundamental structures are Dictionaries (represented as key:value pairs separated by commas and delimited by braces), Lists (represented as values delimited by commas and delimited by brackets), Simple types (number, boolean, string), and null.

    transform: 
      evaltransform | builtintransform | 
      quotetransform | colontransform | 
      dicttransform | listtransform | 
      pathtransform | pathheadtransform |
      simpletransform
      
    quotetransform:
      doublequotetransform | 
      dictquotetransform | listquotetransform |
      simpletransform

    evaltransform: { 
        "!": transform, 
        "*": fulldicttransform,
        "key": transform, ...
    }
    
    builtintransform: { 
        "&": string, 
        "*": dicttransform
        "key": transform, ...
    }
    
    colontransform: { ":": mas }
    
    doublequotetransform: { "''": transform }

    dicttransform: { key: transform, ... }
    
    dictquotetransform: { nondoublequotestring: quotetransform, ... }
    
    fulldicttransform: { string: transform, ... }

    listtransform: standardlisttransform, flattenlisttransform
    
    standardlisttransform: [ transform, ... ] 
    
    flattenlisttransform: [ "&&", transform, ... ]
      
    listquotetransform: [ quotetransform, ... ] 

    pathheadtransform: "#" + string
      
    pathtransform: "##" + string
      
    simpletransform: nonpathstring | number | boolean | null

    key: string not including "!", "'", "&", ":", "*"
    
    mas: dict, list, simple
    
    dict: { string: mas, ... }
    
    list: [ mas, ... ]
    
    simple: number | boolean | string | null
    
    nonpathstring: x + string where x != "#" | "##"

    nondoublequotestring: x + string where x != "''"
    
    declaration:  
      {
        "name": string,
        "language": "sUTL0",
        "transform-t": transform,           // required
        "test-t": transform,
        "requires": [ string, ... ]
      }

    declarations: [ declaration, ... ]

    distribution: [ declaration, ... ]
      where all declarations have at least name, language, and transform-t.
      
    distributions: [ distribution, ... ] 
    
    library: { string: transform, ... }
    
## Basic functions of sUTL

There are a handful of basic functions that comprise sUTL. They are detailed here in pseudo code.

### evaluate

This is the sUTL interpreter. It takes a source MAS structure, a transform, a library, and a builtins dictionary, and returns the source as transformed by the transform.

The library and builtins dictionaries here could just as easily be a host language function from name to transform or name to function respectively.

Note that evaluate doesn't work on declarations, and has no knowledge of them. 

    evaluate(src: mas, tt: transform, l: fulldicttransform, b: builtins):
      _evaluate(src, tt, l, src, tt, b)
      
    _evaluate(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtinsdict):
      t is evaltransform: 
        return _evaluateEval(s, t, l, src, tt, b)
      t is builtintransform: 
        return _evaluateBuiltin(s, t, l, src, tt, b)
      t is quotetransform:
        return _evaluateQuote(s, t, l, src, tt, b)
      t is colontransform:
        return _evaluateColon(t)
      t is dicttransform:
        return _evaluateDict(s, t, l, src, tt, b)
      t is listtransform:
        t[0] == "&&":
          return _flatten(_evaluateList(s, t[1:], l, src, tt, b))
        else
          return _evaluateList(s, t, l, src, tt, b)
      t is pathtransform:
        return _evaluatePath(s, t[2:], l, src, tt, b)
      t is pathheadtransform:
        return _evaluatePathHead(s, t[1:], l, src, tt, b)
      t is simpletransform:
        return t
        
    _evaluateQuote(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtinsdict):
      t is doublequotetransform: 
        return _evaluate(s, t["''"], l, src, tt, b)
      t is dictquotetransform:
        return _evaluateDictQuote(s, t, l, src, tt, b)
      t is listquotetransform:
        return _evaluateListQuote(s, t, l, src, tt, b)
      t is simpletransform:
        return t

    _evaluateEval(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return _evaluate(s2, t2, l2, src, tt, b)
        where t2 = _evaluate(s, t["!"], l, src, tt, b)
          and s2 = { key: _evaluate(s, t[key], l, src, tt, b)
                       for key in t }
          and l2 = { key: _evaluate(s, t["*"][key], l, src, tt, b)
                       for key in t["*"] }, if t["*"], else l
                       
    _evaluateBuiltin(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return builtinf(s, s2, l2, src, tt, b)
        where builtinf = b[t["&"]]
          and s2 = { key: _evaluate(s, t[key], l, src, tt, b)
                       for key in t }
          and l2 = { key: _evaluate(s, t["*"][key], l, src, tt, b)
                       for key in t["*"] }, if t["*"], else l
                       
    _evaluateColon(t: transform):
      return t["''"]
      
    _evaluateDict(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return { key: _evaluate(s, t[key], l, src, tt, b) 
                      for key in t }

    _evaluateDictQuote(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return { key: _evaluateQuote(s, t[key], l, src, tt, b) 
                      for key in t }
                      
    _evaluateArray(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return [ _evaluate(s, t[ix], l, src, tt, b) 
                      for ix in t ]
                      
    _evaluateArrayQuote(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return [ _evaluateQuote(s, t[ix], l, src, tt, b) 
                      for ix in t ]
                      
    _evaluatePathHead(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return result[0] if result else null
                where result = _evaluatePath(s, t, l, src, tt, b)

    _evaluatePath(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return _evaluate(s, path_t, l, src, tt, b)
        where path_t = {
          "&": "path",
          "path": t
        }
        
    _flatten(l: list):
      [item for item in l1 for l1 in l2]
        where l2 = [i2 for i in l where i2 = i if i is list else [i]]
        
### compilelib

The compilelib() function takes a list of declarations that you want a library for, a list of distributions that you're going to use to compile the library, and a seed lib to start from. Usually use an empty seed lib like {}.

Note that the name of a transform in the lib is the require name, not the declared name. So if your transform requires "map_basics", and that matches "map_basics_emlynoregan_com", then it'll be called "map_basics" in the lib (and so can be refered to that way in the transform itself).

It returns pair of (lib, fails), only one of which will be set. If lib is set then it is a usable lib. Otherwise fails will be a list of the evaluation of tests that failed. By convention each should be a list of strings, each saying what a given failure was.

    compilelib(decls: declarations, dists: distributions, l: library, test: boolean, b: builtins):
      resultlib = copy(l)

      # Add requirements on self for any decl in decls to resultlib
      resultlib += {        
        decl.name: decl.transform-t 
        for decl in decls 
        for reqname in decl.requires 
            if not reqname in l and reqname is prefix of decl.name
      }
      
      # names of all required decls not already in the library
      needed_decl_names = [ 
        name for name in decl.requires 
            for decl in decls 
            where not name in l and name is not a prefix of decl.name
      ]  
      
      all_candidate_decls = { reqname: [] for reqname in needed_decl_names }

      for reqname in needed_decl_names:
        candidate_decls = [
          distdecl 
            for dist in dists 
            for distdecl in dist 
                if reqname is a prefix of distdecl.name  
        ]
        
        all_candidate_decls[reqname] += candidate_decls
        
      fails = []
      
      for reqname, candidate_decls in all_candidate_decls:
        if candidate_decls:
            localfails = []
            
            for candidate_decl in candidate_decls:
                fail, lib = compilelib([candidate_decl], dists, resultlib, test, b)

                fail:
                    localfails += fail
                lib:
                    # here the candidate_decl has passed as a usable library
                    localfails = [] # not a fail

                    # add in libs required by candidate_decl
                    resultlib += lib 

                    # and add candidate_decl itself 
                    resultlib[reqname] = candidate_decl.transform-t

            if localfails:
                fails += localfails
      
      # here result-lib includes everything we could find for requires from candidate_decls

      if test:
        for decl in decls:
          # filter lib back to only what decl wants
          decl-lib = { key: resultlib[key] for key in resultlib if key in decl.requires }
          
          # evaluate the test. If the result is truthy, the test fails
          fail = evaluate(decl.transform_t, decl.test-t, decl-lib, b)
          
          if fail:
            fails += fail
            
      # else can't fail here
      
      if fails:
        return null, fails
      else:
        return resultlib, null

## Assembling the distributions

It is intended that dists should be sourceable from anywhere that makes sense; urls to json text files, stored in datastores, stored in local files, maybe even retrieved from torrents. Decisions in this regard shouldn't be made until the language beds down.

## Builtins

Builtins are functions from the host language that provide the basic operations of sUTL. Everything else builds on the builtins.

Builtins are invoked like so:

    {
      "&": <builtin name>,
      key: transform, ...
    }

eg:

    {
      "&": "+",
      "a": 5,
      "b": 1
    }

would evaluate to 6.

The builtins are as follows:

### path
The path builtin evaluates a [JSONPath](http://goessner.net/articles/JsonPath/), and returns the list of MAS objects that the path selects.

Format:

    {
        "&": "path",
        "path": <JSONPath>
    }

Standard JSONPaths start with "$" as the root of the source document. The path builtin allows the following alternatives:

- "$": The root of the source document
- "@": The local scope
- "*": The library
- "~": The root of the transform

So for example,

- "$.thing.stuff" selects the value of the attribute "stuff" in the dictionary "thing" at the root of the source MAS structure
- "@.item" selects the value of the attribute "item" in the local scope, eg:
    
    {
        "!": {"'": {
            "&": "+",
            "a": "#@.item",
            "b": 1
        }},
        "item": 5
    },

evaluates to 

    6

- "*.map" selects the transform "map" from the library. "map" is available in the core library (see [core](#core)).

Note that the path builtin is so central to sUTL that it has two special string notations:

    "##" + <JSONPath>
    
is equivalent to
    
    {
        "&": "path",
        "path": <JSONPath>
    }
    
ie: it evaluates to a list containing zero or more selected items

and

    "#" + <JSONPath>
    
is equivalent to the head of the list returned by   
    
    "##" + <JSONPath>
    
or null if the list is empty. It'a also equivalent to
    
    {
        "!": "#*.head",
        "list": "##" + <JSONPath>
    }

using "*.head" from the core library.

### if

"if" is a conditional statement. If the transform "cond" evaluates to true, it evaluates to the transform "true", or to the transform "false" otherwise.  

Format:

    {
        "&": "if",
        "cond": transform,
        "true": transform,
        "false": transform
    }

Example:
    
    {
        "&": "if",
        "cond": { "&": ">", "a": 3, "b": 4 },
        "true": "3 is greater than 4",
        "false": "3 is not greater than 4"
    }
    
evaluates to 
    
    "3 is not greater than 4"

### keys    
    
Given a dictionary, "keys" evaluates to the list of keys (in no particular order).

Format:

    {
        "&": "keys",
        "map": dictionary,
    }

Example:
    
    {
        "&": "keys",
        "map": {"b": 3, "f": 7}
    }
    
evaluates to 
    
    [ "b", "f" ]
    
### values    
    
Given a dictionary, "values" evaluates to the list of values (in no particular order).

Format:

    {
        "&": "values",
        "map": dictionary,
    }

Example:
    
    {
        "&": "values",
        "map": {"b": 3, "f": 7}
    }
    
evaluates to 
    
    [ 3, 7 ]
    
### type
    
Given any MAS structure, "type" evaluates to a string describing the type, as follows:

- dict: "map",
- list: "list",
- string: "string",
- number: "number",
- boolean: "boolean",
- null: "null"

Format:

    {
        "&": "type",
        "value": mas,
    }

Example:
    
    {
        "&": "type",
        "value": [1, 2, 3]
    }
    
evaluates to 
    
    "list"
    
### makemap
    
Given a list of pairs (two element lists), "makemap" makes a dictionary, where the first element of each sub list becomes a key, the second the corresponding value. Sublists that aren't two elements long or where the first element is not a string are skipped.

Format:

    {
        "&": "makemap",
        "value": list,
    }

Example:
    
    {
        "&": "makemap",
        "value": [["b", 3], ["f", 7]]
    }
    
evaluates to 
    
    {
        "b": 3,
        "f": 7
    }

### Binary arithmetic operators

These all expect numeric operands "a" and "b". "+" also accepts strings.

- "+": Addition on numbers, Concatenation on strings.
- "-": Subtraction
- "*": Multiplication
- "/": Division

Format:

    {
        "&": "*",
        "a": <number>,
        "b": <number>
    }

Example:
    
    {
        "&": "*",
        "a": 4,
        "b": 6.4
    }
    
evaluates to 
    
    25.6

### Equality operators

These are "=" and "!=" for equal and not equal, respectively. They evaluate to a boolean.

- If the operands are simple types (string, number, bool), both operands are the same type, and both operands have the same value, then "=" evaluates to true. 
- If both operands are null, then "=" evaluates to true. 
- In all other cases "=" evaluates to false.

"!=" evaluates to the opposite of "=". So

    {
        "&": "!=",
        "a": <value>,
        "b": <value>
    }

is always equivalent to

    {
        "&": "!",
        "a": {
            "&": "=",
            "a": <value>,
            "b": <value>
        }
    }

### Comparison operators

These operators compare two operands, "a" and "b" as left and right sides respectively. 

- If the operands are numbers, then the operation is applied and the transform evaluates to a boolean.
- Otherwise it evaluates to null.

Operators:

- ">": greater than
- "<": less than
- ">=": greater than or equal to
- "<=": less than or equal to

Format:
    {
        "&": ">",
        "a": <value>,
        "b": <value>
    }

Example:

    {
        "&": ">",
        "a": 4,
        "b": 3
    }

evaluates to 

    true

### Logical operators

These operators include the following:

- "&&": and,
- "||": or,
- "!": not

"&&" and "||" take left operand "a" and right operand "b", and return a boolean result.
"!" takes a single operand "a" and returns a boolean result.

The operands are evaluated for truthiness. A mas structure is truthy if it is not falsey. It is falsey if

- it is the boolean value false,
- it is the number 0,
- it is the empty string,
- it is the empty list,
- it is the empty dictionary, or
- it is null

Evaluation:

- "&&" evaluates to true if both operands are truthy, false otherwise
- "!!" evaluates to true if either or both operands are truthy, false otherwise
- "!" evaluates to true if its operand is falsey, false otherwise

Format:

    {
        "&": "&&",
        "a": <value>,
        "b": <value>
    }

Example:

    {
        "&": "&&",
        "a": true,
        "b": true
    }

evaluates to 

    true

## Core

There is a core library distribution "core_emlynoregan_com" available at [http://emlynoregan.github.io/sUTL-spec/sUTL_core.json].

All transforms in core are named <name>_core_emlynoregan_com. You can refer to them just as <name>, or as <name>_core, or <name>_core_emlynoregan_com, or any other prefix of <name>_core_emlynoregan_com beginning with <name>.

To use the core library transforms, you need to load the distribution from json at  [http://emlynoregan.github.io/sUTL-spec/sUTL_core.json], put that in a distribution list with any other distributions you wish to use. 

    distributions = [ <core lib>, ... ] 

Then, create a declaration from your transform that uses the core library, like so:

    my_t = {
        "!": "#*.map",
        "list": [1, 2, 3, 4],
        "t": {"'": {
            "&": "*",
            "a": "#@.item",
            "b": 2
        }}
    }

    my_decl = {
      "transform-t": my_t,
      "requires": ["map"]
    }
    
    my_decls = [my_decl, ...]

The declaration above imports "map" (which is in the core library) by putting it in a requires section, then refers to it as "*.map" in the actual transform.

Then call compilelib like this:

    lib = compilelib(my_decls, distributions, {}, false, builtins)
    
    result = evaluate(source, my_t, lib, builtins)

The transforms included in the core library distribution are as follows:

### map

map takes a list and a transform, and applies the transform to each element in the list. Inside the supplied transform, the current list element is available in local scope as "item". 

Format:

    {
        "!": "#*.map",
        "list": list,
        "t": transform
    }

Example:

    {
        "!": "#*.map",
        "list": [1, 2, 3, 4],
        "t": {"'": {
            "&": "*",
            "a": "#@.item",
            "b": 2
        }}
    }

evaluates to

    [2, 4, 6, 8]

### reduce

reduce takes a list and a transform, and an accumulator (null if none is provided). 

If the list is empty, it evaluates to the accumulator.

Otherwise, it evaluates to a reduce on the tail of the list, with the accumulator as the evaluation of the given transform "t", applied to the head of the list, with the head available as "item" and the previous accumulator as "accum" in "t"'s local scope.

Format:

    {
        "!": "#*.reduce",
        "list": list,
        "t": transform,
        "accum": mas
    }

Example:

    {
        "!": "#*.reduce",
        "list": [1, 2, 3, 4],
        "accum": 1,
        "t": {"'": {
            "&": "*",
            "a": "#@.item",
            "b": "#@.accum"
        }}
    }

evaluates to
    
    24

What's happening in this example? The elements of the list are multiplied together, with a running total held in the accumulator.

### reverse

reverse takes a list and evaluates to its reverse (elements in opposite order). 

Format:

    {
        "!": "#*.reverse",
        "list": list
    }

Example:

    {
        "!": "#*.reverse",
        "list": [1, 2, 3, 4]
    }

evaluates to
    
    [4, 3, 2, 1]

### head, tail, front, last

These all take a list.

head evaluates to the first element of the list

tail evaluates to the list containing all elements except the head

last evaluates to the last element of the list

front evaluates to the list containing all elements except the last

Format:

    {
        "!": "#*.head",
        "list": list
    }

Example 1:

    {
        "!": "#*.head",
        "list": [1, 2, 3, 4]
    }

evaluates to
    
    1

Example 2:

    {
        "!": "#*.tail",
        "list": [1, 2, 3, 4]
    }

evaluates to
    
    [2, 3, 4]

### concat

Given two lists, it concatenates them into one.

If either operand is not a list, treated as a list containing one element.

Format:

    {
        "!": "#*.concat",
        "a": list,
        "b": list
    }

Example 1:

    {
        "!": "#*.concat",
        "a": [1, 2, 3, 4],
        "b": [5, 6, 7]
    }

evaluates to
    
    [1, 2, 3, 4, 5, 6, 7]

Example 2:

    {
        "!": "#*.concat",
        "a": 1,
        "b": [2, 3]
    }

evaluates to
    
    [1, 2, 3]

### removenulls

Given a list, it evaluates to the same list with nulls removed.

Format:

    {
        "!": "#*.removenulls",
        "list": list
    }

Example:

    {
        "!": "#*.removenulls",
        "list": [1, 2, null, 3, 4]
    }

evaluates to
    
    [1, 2, 3, 4]

### count

Counts the number of elements of an object. This is calculated as:

- Object is a list? Transitively count each element of the list, and sum the total.
- Otherwise, the count is 1.

So count of 5 is 1, count of null is 1, count of a dict is 1, count of a list of three numbers is 3, count of a list of three lists each containing two elements is 6.

This is very useful as a test of empiness of a list, where you want to treat lists of empty lists as empty. For example, [[], [], [[], []]] has a count of 0.

Format:

    {
        "!": "#*.count",
        "obj": mas
    }

Example:

    {
        "!": "#*.count",
        "obj": [1, 2, [3, 4], 5, 6, [7, [8, 9]]]
    }

evaluates to
    
    9

### sum

Sums the numbers in a list, ignoring non numbers, and summing sublists transitively, exactly like count does.

Format:

    {
        "!": "#*.sum",
        "obj": mas
    }

Example:

    {
        "!": "#*.sum",
        "obj": [1, 2, [3, 4], 5, 6, [7, [8, 9]]]
    }

evaluates to
    
    45

### zip

Takes a list of lists, and performs a [convolution](https://en.wikipedia.org/wiki/Convolution_(computer_science)) 
If the lists don't match up, the result is padded with nulls

Format:

    {
        "!": "#*.zip",
        "list": list
    }

Example 1:

    {
        "!": "#*.zip",
        "list": [["b", "f"], [3, 7]]
    }

evaluates to
    
    [["b", 3], ["f": 7]]

Example 2:

    {
        "!": "#*.zip",
        "list": [
          ["a", "b", "c"], 
          [1, 2, 3],
          [4, 5, 6],
          [true, false]
        ]
    }

evaluates to:

    [
      ["a", 1, 4, true],
      ["b", 2, 5, false],
      ["c", 3, 6, null]
    ]

### addmaps

Takes two dicts and merges them. "map2" takes precedence over "map1".

Format:

    {
        "!": "#*.addmaps",
        "map1": dictionary,
        "map2": dictionary,
    }

Example:

    {
        "!": "#*.addmaps",
        "map1": {"a": 1, "b": 2},
        "map2": {"b": 5, "c": 6}
    }

evaluates to
    
    {
      "a": 1,
      "b": 5,
      "c": 6
    }

### removekeys

Takes a dict and a list of keys, and removes keys in the key list from two dictionary, ignoring any that don't appear.

Format:

    {
        "!": "#*.removekeys",
        "map": dictionary,
        "keys": list,
    }

Example:

    {
        "!": "#*.removekeys",
        "map": {"a": 1, "b": 2},
        "keys": ["b", "c"]
    }

evaluates to
    
    {
      "a": 1
    }

### mapget

Given a map and a key, evaluate to the value for that key in the map.

Format:

    {
        "!": "#*.mapget",
        "map": dictionary,
        "key": string,
    }

Example:

    {
        "!": "#*.mapget",
        "map": {"a": 1, "b": 2},
        "keys": "b"
    }

evaluates to
    
    2

### keys2map

Given a list of keys, make a dict with these keys and the boolean value true.

Format:

    {
        "!": "#*.keys2map",
        "list": list,
    }

Example:

    {
        "!": "#*.keys2map",
        "list": ["a", "b", "c"]
    }

evaluates to
    
    {
      "a": true,
      "b": true,
      "c": true
    }
    
### filter

Given a list and a filter transform, evaluate to the same list with all items removed where the filter transform evaluates to falsey. In the filter transform, the current item is available as "item".

Format:

    {
        "!": "#*.filter",
        "list": list,
        "filter-t": transform
    }

Example:

    {
        "!": "#*.filter",
        "list": ["a", "b", "c"],
        "filter-t": {"'": {
          "&": "!=",
          "a": "#@.item",
          "b": "b"
        }}
    }

evaluates to
    
    ["a", "c"]

### isinlist

Given a list and an item, evaluate to true if item is in the list, false otherwise.

Format:

    {
        "!": "#*.isinlist",
        "list": list,
        "item": mas
    }

Example:

    {
        "!": "#*.isinlist",
        "list": ["a", "b", "c"],
        "item": "b"
    }

evaluates to
    
    true

### subtractarrs

Given two lists arr1 and arr2, subtract arr2 from arr1.

Format:

    {
        "!": "#*.subtractarrs",
        "arr1": list,
        "arr2": list
    }

Example:

    {
        "!": "#*.subtractarrs",
        "arr1": ["a", "b", "c"],
        "arr2": ["b", "d", "a"]
    }

evaluates to
    
    ["c"]

