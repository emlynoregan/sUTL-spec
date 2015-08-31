distributions.push([
  {
    "name": "fred_l_emlynoregan_com",
    "language": "sUTL0",
    "transform-t": "fred!!!"
  },
  {
    "name": "fredlist_l_emlynoregan_com",
    "language": "sUTL0",
    "transform-t": [ "#*.fred_l", "#*.fred_l" ],
    "test-t": {
      "&": "if",
      "cond": {"'": 
        {
          "&": "!=",
          "a": "#*.fred_l",
          "b": "fred!!!"
        }
      },
      "true": "fred behaves unexpectedly",
      "false": null
    },
    "requires": ["fred_l"]
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
])
