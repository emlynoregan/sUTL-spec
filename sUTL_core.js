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
                "in": "#@.list"
              }
            },
            {
              "!": "#*.map_core_emlynoregan_com",
              "list": {
                "!": "#*.tail_core_emlynoregan_com",
                "in": "#@.list"
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
      "name": "head_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "#@.in[0]"
    },
    {
      "name": "tail_core_emlynoregan_com",
      "language": "sUTL0",
      "transform-t": "##@.in[1:]"
    }
  ]
)
