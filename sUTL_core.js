distributions.push(
  [
    {
      "name": "example_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "Core: Example"
    },
    {
      "name": "example2_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": [ "#*.example_core", "#*.example_core" ],
      "test-t": {
        "&": "if",
        "cond": {"'": 
          {
            "&": "!=",
            "a": "#*.example_core",
            "b": "Core: Example"
          }
        },
        "true": "example_core behaves unexpectedly",
        "false": null
      },
      "requires": ["example_core"]
    },
    {
      "name": "example3fails_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "Core: Example 3",
      "test-t": [
        "Example 3 Fails"
      ]
    },
    {
      "name": "map_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": 
      {
        "&": "if",
        "cond": "#@.list",
        "true": {
          "'": [
            "&&",
            {
              "!": "#@.t",
              "item": {
                "!": "#*.head_core_emlynoregan_com",
                "list": "#@.list"
              }
            },
            {
              "!": "#*.map_core_emlynoregan_com",
              "list": {
                "!": "#*.tail_core_emlynoregan_com",
                "list": "#@.list"
              },
              "t": "#@.t"
            }
          ]
        },
        "false": {
          "'": []
        }
      },
      "requires": [
        "map_core_emlynoregan_com", 
        "head_core_emlynoregan_com", 
        "tail_core_emlynoregan_com"
      ]
    },
    {
      "name": "reduce_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": {
        "&": "if",
        "cond": "#@.list",
        "true": { "'": {
          "!": "#*.reduce_core_emlynoregan_com",
          "list": {
            "!": "#*.tail_core_emlynoregan_com",
            "list": "#@.list"
          },
          "t": "#@.t",
          "accum": {
            "!": "#@.t",
            "item": {
              "!": "#*.head_core_emlynoregan_com",
              "list": "#@.list"
            },
            "accum": "#@.accum"
          }
        }},
        "false": {
          "'": "#@.accum"
        }
      },
      "requires": [
        "reduce_core_emlynoregan_com", 
        "head_core_emlynoregan_com", 
        "tail_core_emlynoregan_com"
      ]
    },
    {
      "name": "reverse_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t":
      {
        "&": "if",
        "cond": "#@.list",
        "true": {
          "'": [
            "&&",
            {
              "!": "#*.reverse_core_emlynoregan_com",
              "list": {
                "!": "#*.tail_core_emlynoregan_com",
                "list": "#@.list"
              }
            },
            {
              "!": "#*.head_core_emlynoregan_com",
              "list": "#@.list"
            }
          ]
        },
        "false": {
          "'": []
        }
      },
      "requires": [
        "reverse_core_emlynoregan_com", 
        "head_core_emlynoregan_com", 
        "tail_core_emlynoregan_com"
      ]
    },
    {
      "name": "head_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "#@.list[0]"
    },
    {
      "name": "last_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "#@.list[-1:]"
    },
    {
      "name": "tail_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "##@.list[1:]"
    },
    {
      "name": "front_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "##@.list[:-1]"
    },
    {
      "name": "concat_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": [ 
        "&&",
        "#@.a",
        "#@.b"
      ]
    },
    {
      "name": "removenulls_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": {
        "!": "#*.reduce_core_emlynoregan_com",
        "list": "#@.list",
        "t": {"'": {
         "&": "if",
         "cond": "#@.item",
         "true": {
             "&": "if",
             "cond": "#@.accum",
             "true": ["&&", "#@.accum", ["#@.item"]],
             "false": ["#@.item"]
         },
         "false": {
             "&": "if",
             "cond": "#@.accum",
             "true": ["&&", "#@.accum"],
             "false": []
         }
        }}
      },
      "requires": [
        "reduce_core_emlynoregan_com"
      ]
    },
    {
      "name": "count_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": 
      {
        "&": "if",
        "cond": {"'": {
          "&": "=",
          "a": "list",
          "b": {
            "&": "type",
            "value": "#@.obj"
          }
        }},
        "true": {"'": {
            "!": "#*.reduce_core_emlynoregan_com",
            "list": "#@.obj",
            "accum": 0,
            "t": {"'": {
              "&": "+",
              "a": {
                "!": "#*.count_core_emlynoregan_com",
                "obj": "#@.item"
              },
              "b": "#@.accum"
            }}
        }},
        "false": {"'": 1}
      },
      "requires": ["reduce_core_emlynoregan_com", "count_core_emlynoregan_com"]
    },
    {
      "name": "sum_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": 
      {
        "&": "if",
        "cond": {"'": {
          "&": "=",
          "a": "list",
          "b": {
            "&": "type",
            "value": "#@.obj"
          }
        }},
        "true": {"'": {
            "!": "#*.reduce_core_emlynoregan_com",
            "list": "#@.obj",
            "accum": 0,
            "t": {"'": {
              "&": "+",
              "a": {
                "!": "#*.sum_core_emlynoregan_com",
                "obj": "#@.item"
              },
              "b": "#@.accum"
            }}
        }},
        "false": {"'": { 
          "&": "if",
          "cond": {"'": {
            "&": "=",
            "a": "number",
            "b": {
              "&": "type",
              "value": "#@.obj"
            }
          }},
          "true": {"'": "#@.obj"},
          "false": 0
        }}
      },
      "requires": ["reduce_core_emlynoregan_com", "sum_core_emlynoregan_com"]
    },
    {
      "name": "zip_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": {
        "&": "if",
        "cond": {"'": {
          "&": "<",
          "a": 0,
          "b": {
            "!": "#*.count_core_emlynoregan_com",
            "obj": "#@.list"
          }
        }},
        "true": {"'": [
          "&&",
          [
            {
              "!": "#*.reduce_core_emlynoregan_com", 
              "list": "#@.list",
              "accum": [],
              "t": {"'": [
                "&&",
                "#@.accum",
                {
                  "!": "#*.head_core_emlynoregan_com",
                  "list": "#@.item"
                }
              ]}
            }
          ],
          {
            "!": "#*.zip_core_emlynoregan_com",
            "list": {
              "!": "#*.reduce_core_emlynoregan_com", 
              "list": "#@.list",
              "accum": [],
              "t": {"'": [
                "&&",
                "#@.accum",
                [
                  {
                    "!": "#*.tail_core_emlynoregan_com",
                    "list": "#@.item"
                  }
                ]
              ]}
            }
          }
        ]},
        "false": []
      },
      "requires": [
        "zip_core_emlynoregan.com", 
        "count_core_emlynoregan.com", 
        "require_core_emlynoregan.com",
        "head_core_emlynoregan.com", 
        "tail_core_emlynoregan.com"
      ]
    }
  ]
)
