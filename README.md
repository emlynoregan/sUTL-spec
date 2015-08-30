# sUTL-spec
The specification for sUTL Universal Transform Language, v0.2

[Try the online editor here!](http://emlynoregan.github.io/sUTL_js/)

[Javascript implementation here!](https://github.com/emlynoregan/sUTL_js)

sUTL is a Lisp dialect that is specified in and operates natively on MAS structures (Maps/Dicts, Arrays/Lists, Simple Types) in a host language. MAS structures are defined as exactly those which successfully serialise to JSON and deserialise from JSON, so JSON is a convenient way to think about MAS. However, it is important to remember that MAS is not JSON; it is the territory to JSON's map.

The primary purpose of sUTL is to be a universal transform tool that operates across many languages; whether you use Python, Javascript, Java, etc, you should be able to use sUTL transforms. As the library of well tested transforms grows, they can potentially be easily accessible in any host language, and should always evaluate identically regardless of the host environment chosen.

## MAS
MAS has been chosen because analogues are available in most computer languages, particularly the dynamic languages (javascript, python, perl, ...), and these analogues are often fundamental data structures in the host language, meaning the host language can be very expressive when dealing with these structures, and large parts of the host language tend to deal exclusively in these structures. This makes sUTL live very comfortably inside these language, and minimises impedence mismatches at the interface between sUTL and its hosts.

## Transforms
sUTL is not strictly a functional language, in that its fundamental unit is a Transform rather than a Function. A Transform is conceptually more like what languages such as XSLT, Mustache, Smarty, and Jinja deal in, but in expressive power it is at least as powerful as higher order dynamic language functions and shares many characteristics with them. 

It is perfectly possible to reason about sUTL transforms by drawing the analogy to Lisp functions, and most theory from the lambda calculus, the various Lisps, and functions in general can be transfered to transforms. 

## Declarations
Transforms in sUTL don't have any kind of contract with callers, except what might be gleaned by analysing their details. 

Declarations are a wrapper around a transform, and are analogous to a mix of a function signature and a package manifest.

### Language Version
A declaration must have a language version. Currently the version is specified as:

- "language": "sUTL0"

Current version code should reject any declaration that differs from this. Future version callers can decide how to handle this attribute.

### Signature
A declaration is a dictionary that needs three attributes to be usable as a general signature:
- "transform-t": This is the actual transform. It requires a library as described by "requires".
- "requires": This is a list of publishnames. A caller can use these to provide matching transforms in the library when evaluating the transform. 
- "test-t": This is a special transform, which can be used to test the transform "transform-t". When evaluated on "transform-t" as its source, it is falsey if the test succeeds, or truthy if it fails. A convention is that a failed (truthy) result should be an errorreport (see the grammar below), describing what failures occured in the test. See the function loadlib() below for details on how these tests can be invoked.

With further regard to tests, you will note that there is no specification of versioning in Declarations, or in "requires" sections. However, it is intended that many uses of sUTL will involve pulling declarations of functions from websites at run time or whenever desired. This means that a transform written to expect a particular library transform, say A, can receive a modified version, say A', at a later time. There are no guarantees that A is in any way similar to A'.

Instead of using versioning to address this concern, sUTL uses tests to allow a transform author to apply acceptance tests to their required library transforms. That is, if you are worried that an imported transform A might change on you, you can write your test-t to include acceptance testing of A as well as testing on yourself.

Also note that if you want to separate the concerns of acceptance testing an required transform from testing your own transform, you can write the acceptance tests as part of a separate, "testing" transform, and require it in your own transform. Separated like this, you can also consume someone else's test transforms rather than writing your own.

### Naming
To be publishable, ie: to be able to be required by another transform, the declaration must include a name. This is a structured string, which should include naming from most specific to most general, separated by underscores. eg: "map_basics_emlynoregan_com"
In a "requires" list, a requirement matches the first declaration it finds where the require name is equal to or is a prefix of the declaration's name.

eg: A requirement of "map_basics" would match a declaration name of "map_basics_emlynoregan_com", but it would also match "map_basics_mock". This construct should allow dependency injection semantics to be achieved.

A recommmended convention is that all of your declaration names should have a final element which is a domain name you own, eg: "emlynoregan.com". This acts as a namespace separating your transforms from those of others. This is only a convention, however, and may be broken for lots of reasons, not least of which is to substitute alternative versions of libraries to prebuilt transforms.

## Distribution
A distribution is an ordered list of declarations. The ordering allows a light versioning; a particular distribution could contain a number of transforms with the same name. Consumers are able to just grab the latest, or grab the first one of a given name that passes their tests (very powerful, because it lets you release new versions of a transform without breaking old dependent transforms which rely on deprecated behavior), or other approaches as desired. 

## Grammar

In this grammar, the fundamental structures are Dictionaries (represented as key:value pairs separated by commas and delimited by braces), Lists (represented as values delimited by commas and delimited by brackets) and Simple types (number, boolean, string).

    transform: 
      eval | builtineval | quoteeval | dicttransform | 
      listtransform | pathtransform | simpletransform
      
    eval: { 
        "!": transform, 
        "*": fulldicttransform,
        "key": transform, ...
    }
    
    builtineval: { 
        "&": string, 
        "*": dicttransform
        "key": transform, ...
    }
    
    quoteeval: { "'": transform }
    
    dicttransform: { key: transform, ... }
    
    fulldicttransform: { string: transform, ... }

    listtransform: 
      [ transform, ... ] |
      [ "&&", transform, ... ]
      
    pathheadtransform:
      "#" + string
      
    pathtransform:
      "##" + string
      
    simpletransform: number | boolean | nonpathstring

    key: string not including "!", "'", "&"
    
    mas: dict, list, simple
    
    dict: { string: mas, ... }
    
    list: [ mas, ... ]
    
    simple: number | boolean | string
    
    nonpathstring: x + string where x != "#" | "##"
    
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
      where all declarations have at least name, language, and X.
    
    distributions: [ distribution, ... ] 
    
    
## Basic functions of sUTL

There are a handful of basic functions that comprise sUTL. They are detailed here in pseudo code.

### evaluate

This is the sUTL interpreter. It takes a source MAS structure, a transform, a library dictionary, and a buitins dictionary, and returns the source as transformed by the transform.

The library and builtins dictionaries here could just as easily be a host language function from name to transform or name to function respectively.

Note that evaluate doesn't work on declarations, and has no knowledge of them. 

    evaluate(src: mas, tt: transform, l: fulldicttransform, b: builtins):
      _evaluate(src, tt, l, src, tt, b)
      
    _evaluate(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtinsdict):
      t is eval: 
        return _evaluateEval(s, t, l, src, tt, b)
      t is builtineval: 
        return _evaluateBuiltin(s, t, l, src, tt, b)
      t is quoteeval:
        return _evaluateQuote(t)
      t is dicttransform:
        return _evaluateDict(s, t, l, src, tt, b)
      t is listtransform:
        t[0] == "&&":
          return _flatten(_evaluateList(s, t[1:], l, src, tt, b))
        else
          return _evaluateList(s, t, l, src, tt, b)
      t is pathheadtransform:
        return _evaluateHeadPath(s, t[1:], l, src, tt, b)
      t is pathtransform:
        return _evaluatePath(s, t[2:], l, src, tt, b)
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
                       
    _evaluateQuote(t: transform):
      return t["'"]
      
    _evaluateDict(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return { key: _evaluate(s, t[key], l, src, tt, b) 
                      for key in t }
                      
    _evaluateArray(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return [ _evaluate(s, t[ix], l, src, tt, b) 
                      for ix in t ]
                      
    _evaluateHeadPath(s: mas, t: transform, l: fulldicttransform,  
                 src: mas, tt: transform, b: builtins):
      return _evaluatePath(s, headpath_t, l, src, tt, b)[0]

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

The compilelib() function takes a list of declarations that you want a library for, a list of distributions that you're going to use to compile the library, and a seed lib to start from. Usually use a lib like {}.

Note that the name of a transform in the lib is the require name, not the declared name. So if your transform requires "map_basics", and that matches "map_basics_emlynoregan_com", then it'll be called "map_basics" in the lib (and so can be refered to that way in the transform itself).

It returns pair of (lib, fails), only one of which will be set. If lib is set then it is a usable lib. Otherwise fails will be a list of the evaluation of tests that failed. By convention each should be a list of strings, each saying what a given failure was.

    compilelib(decls: declarations, dists: distributions, l: fulldicttransform, test: boolean, b: builtins):
    
      # names of all required decls not already in the library
      needed_decl_names = [ name for name in decl.requires for decl in decls where not name in l ]  
      
      needed_decl_names = remove_duplicates(needed_decl_names)

      # for each needed_decl_name, get a list of candidate declarations from the distributions, in order
      candidate_decls = { 
        d_name: [ decl for decl in dist for dist in dists 
                if d_name is prefix of decl.name ]
          for d_name in needed_decl_names
      }
      
      result-lib = { key: lib[key] for key in lib } # shallow copy
      fails = []
      
      for key in candidate_decls:
        if candidate_decls[key]:
          candidate_ix = 0
          fails2total = []
          for candidate_decl in candidate_decls[key]:
            result-lib2, fails2 = compilelib(candidate_decl["requires"], dists, result-lib, test, b)
            if fails2:
              fails2total += fails2
            else:
              fails2total = [] # scrub any fails, we were successful here
              result-lib += result-lib2
              break
              
          if fails2total:
            fails += fails2total
      
      # here result-lib includes everything we could find for requires from candidate_decls

      if test:
        for decl in decls:
          # filter lib back to only what decl wants
          decl-lib = { key: result-lib[key] for key in result-lib if key in decl["requires"] }
          
          # evaluate the test. If the result is truthy, the test fails
          fail = evaluate(decl["transform_t"], decl["test-t"], decl-lib, b)
          
          if fail:
            fails += fail
            
      # else these can't really fail
      
      if fails:
        return null, fails
      else:
        return result-lib, null

## Assembling the distributions
This document is agnostic about this. A javascript library is being prepared for the browser which gets distributions by declaring script tags pointing at urls each of which add one or more distributions to a global _dists_ object. Then that object is used as the list of distributions throughout.

It is intended that dists should be sourceable from anywhere that makes sense; web addresses as json text, stored in datastores, stored in local files, maybe even retrieved from torrents. Decisions in this regard shouldn't be made until the language beds down.


