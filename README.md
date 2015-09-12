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
- [Core](#core)


## MAS
MAS has been chosen because analogues are available in most computer languages, particularly the dynamic languages (javascript, python, perl, ...), and these analogues are often fundamental data structures in the host language, meaning the host language can be very expressive when dealing with these structures, and large parts of the host language tend to deal exclusively in these structures. This makes sUTL live very comfortably inside these language, and minimises impedence mismatches at the interface between sUTL and its hosts.

## Transforms
sUTL is not strictly a functional language, in that its fundamental unit is a Transform rather than a Function. A Transform is conceptually more like what languages such as XSLT, Mustache, Smarty, and Jinja deal in, but in expressive power it is at least as powerful as non-lazy higher order dynamic language functions and shares many characteristics with them. 

It is perfectly possible to reason about sUTL transforms by drawing the analogy to Lisp functions, and most theory from the lambda calculus, the various Lisps, and functions in general can be transferred to transforms. 

## Declarations
Transforms in sUTL don't have any kind of contract with callers, except what might be gleaned by analysing their details. 

Declarations are a wrapper around a transform, and are analogous to a mix of a function signature and a package manifest.

A declaration is a dictionary that includes a main transform, and some optional additional information. It can be thought of as a function signature, an interface, or a contract. 

The attributes of the declaration include:
- "transform-t": This is the main transform, ie: the actual transform being declared. Required.
- "requires": This is a list of publishnames. These describe the declared transforms (declarations) that are expected to be in the library when the main transform is evaluated. Optional.
- "test-t": This is a special transform, which can be used to test the transform "transform-t". When evaluated on "transform-t" as its source, it is falsey if the test succeeds, or truthy if it fails. A convention is that a failed (truthy) result should be a list of strings, describing what failures occured in the test. See the function compilelib() below for details on how these tests can be invoked.

With further regard to tests, you will note that there is no specification of versioning in Declarations, or in "requires" sections. However, it is intended that many uses of sUTL will involve pulling declarations of functions from websites at run time or whenever desired. This means that a transform written to expect a particular library transform, say A, can receive a modified version, say A', at a later time. There are no guarantees that A is in any way similar to A'.

Instead of using versioning to address this concern, sUTL uses tests to allow a transform author to apply acceptance tests to their required library transforms. That is, if you are worried that a required transform A might change on you, you can write your test-t to include acceptance testing of A as well as unit testing on yourself.

Also note that if you want to separate the concerns of acceptance testing a required transform from testing your own transform, you can write the acceptance tests as part of a separate, "testing" transform, and require it in your own transform. Separated like this, you can also consume someone else's test transforms rather than writing your own.

### Naming
To be publishable, ie: to be able to be required by another transform, the declaration must include a name. This is a structured string, which should include naming from most specific to most general, separated by underscores. eg: "map_basics_emlynoregan_com"
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
    
## Core

There is a core library "core_emlynoregan_com" available at [http://emlynoregan.github.io/sUTL-spec/sUTL_core.json] .



