# sUTL-spec
The specification for sUTL Universal Transform Language

## Grammar

In this grammar, the fundamental structures are Dictionaries (represented as key:value pairs separated by commas and delimited by braces), Lists (represented as values delimited by commas and delimited by brackets) and Simple types (number, boolean, string).


    transform: 
      eval | builtineval | quoteeval | dicttransform | 
      listtransform | pathtransform | simpletransform
      
    eval: { "!": transform, key: transform, ... }
    
    builtineval: { "&": transform, key: transform, ... }
    
    quoteeval: { "'": transform, key: transform, ... }
    
    dicttransform: { key: transform, ... }
    
    listtransform: 
      [ transform, ... ] |
      [ "&&", transform, ... ]
      
    pathheadtransform:
      "#" + string
      
    pathtransform:
      "##" + string
      
    simpletransform: number | boolean | nonpathstring

    lib: { string: transform, ... }
    
    builtins: { string: host-function, ... }
    
    key: string not including "!", "'", "&"
    
    mas: dict, list, simple
    
    dict: { string: mas, ... }
    
    list: [ mas, ... ]
    
    simple: number | boolean | string
    
    nonpathstring: x + string where x != "#" | "##"
    
    host-function: <function from the host language>
