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
    "name": "map_l_emlynoregan_com",
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
              "!": "#$.head",
              "in": "#@.list"
            }
          },
          {
            "!": "#*.map_l_emlynoregan_com",
            "list": {
              "!": "#$.tail",
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
    "requires": ["map_l_emlynoregan_com"]
  }
]
)
