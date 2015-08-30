# sUTL-spec
The specification for sUTL Universal Transform Language

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

A declaration needs three attributes to be usable as a general signature:
- "X": This is the actual transform. It requires a library as described by "requires".
- "requires": This is a list of publishnames. A caller can use these to provide matching transforms in the library when evaluating the transform. 
- "X-test": This is a special transform, which can be used to test the transform "X". When evaluated on "X" as its source, it is falsey if the test succeeds, or truthy if it fails. A convention is that a failed (truthy) result should be an errorreport (see the grammar below), describing what failures occured in the test. See the function loadlib() below for details on how these tests can be invoked.

With further regard to tests, you will note that there is no specification of versioning in Declarations, or in "requires" sections. However, it is intended that many uses of sUTL will involve pulling declarations of functions from websites at run time or whenever desired. This means that a transform written to expect a particular library transform, say A, can receive a modified version, say A', at a later time. There are no guarantees that A is in any way similar to A'.

Instead of using versioning to address this concern, sUTL uses tests to allow a transform author to apply acceptance tests to their required library transforms. That is, if you are worried that an imported transform A might change on you, you can write your X-test to include acceptance testing of A as well as testing on yourself.

Also note that if you want to separate the concerns of acceptance testing an required transform from testing your own transform, you can write the acceptance tests as part of a separate, "testing" transform, and require it in your own transform. Separated like this, you can also consume someone else's test transforms rather than writing your own.

## Distribution
A distribution is an ordered list of declarations. The ordering allows a light versioning; a particular distribution could contain a number of transforms with the same name. Consumers are able to just grab the latest, or grab the first one of a given name that passes their tests (very powerful, because it lets you release new versions of a transform without breaking old dependent transforms which rely on deprecated behavior), or other approaches as desired. 

## Grammar

In this grammar, the fundamental structures are Dictionaries (represented as key:value pairs separated by commas and delimited by braces), Lists (represented as values delimited by commas and delimited by brackets) and Simple types (number, boolean, string).

    transform: 
      eval | builtineval | quoteeval | dicttransform | 
      listtransform | pathtransform | simpletransform
      
    eval: { 
        "!": transform, 
        "@": fulldicttransform,
        "*": fulldicttransform
    }
    
    builtineval: { 
        "&": transform, 
        "@": dicttransform,
        "*": dicttransform
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

    builtins: { string: host-function, ... }
    
    key: string not including "!", "'", "&"
    
    mas: dict, list, simple
    
    dict: { string: mas, ... }
    
    list: [ mas, ... ]
    
    simple: number | boolean | string
    
    nonpathstring: x + string where x != "#" | "##"
    
    host-function: <function from the host language>

    declaration:  
      {
        "name": publishname,
        "language": sUTL0,
        "X": transform,           // required
        "X-test": transform,
        "requires": [ publishname, ... ]
      }
      
    publishname: [ string, ...]
      
    distribution: [ declaration, ... ]
      where all declarations have at least name, language, and X.
    
## Basic functions of bOTL

There are a handful of basic functions that comprise bOTL. They are detailed here in pseudo

