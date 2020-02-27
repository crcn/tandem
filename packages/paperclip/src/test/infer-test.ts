import { Engine, infer, Inference, InferenceKind, ShapeInference } from "../..";
import { expect } from "chai";

describe(__filename + "#", () => {
  const cases = [
    [
      `{a}`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 2
          }
        }
      }
    ],
    [
      `{a.b}`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 0,
            properties: {
              b: {
                kind: 2
              }
            }
          }
        }
      }
    ],
    [
      `{a.b} {a.c}`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 0,
            properties: {
              b: {
                kind: 2
              },
              c: {
                kind: 2
              }
            }
          }
        }
      }
    ],
    [
      `<span {a}></span>`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 2
          }
        }
      }
    ],
    [
      `<span a={a}></span>`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 2
          }
        }
      }
    ],
    [
      `<span {...a}></span>`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 0,
            properties: {}
          }
        }
      }
    ],
    [
      `{#each items as item}{/}`,
      {
        kind: 0,
        properties: {
          items: {
            kind: 2
          }
        }
      }
    ],
    [
      `{#each items as item, i}{item.name} {i}{/}`,
      {
        kind: 0,
        properties: {
          items: {
            kind: 0,
            properties: {
              name: {
                kind: 2
              }
            }
          }
        }
      }
    ],
    [
      `{#each items as item, i}{item.a} {item.b}{/}`,
      {
        kind: 0,
        properties: {
          items: {
            kind: 0,
            properties: {
              a: {
                kind: 2
              },
              b: {
                kind: 2
              }
            }
          }
        }
      }
    ],
    [
      `
      {#each people as person} 
        {#each person.friends as friend}
          {friend.name}

        {/}
      {/}
    `,
      {
        kind: 0,
        properties: {
          people: {
            kind: 0,
            properties: {
              friends: {
                kind: 0,
                properties: {
                  name: {
                    kind: 2
                  }
                }
              }
            }
          }
        }
      }
    ],
    [
      `{#if a}{/}`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 2
          }
        }
      }
    ],
    [
      `{#if a}{/else if b} {/}`,
      {
        kind: 0,
        properties: {
          a: {
            kind: 2
          },
          b: {
            kind: 2
          }
        }
      }
    ],
    [
      `{#if true}{cc} {/}`,
      {
        kind: 0,
        properties: {
          cc: {
            kind: 2
          }
        }
      }
    ],
    [
      `<preview>{a}</preview>`,
      {
        kind: 0,
        properties: {}
      }
    ]
  ];

  const engine = new Engine();
  for (const [source, inference] of cases) {
    it(`can infer ${source}`, () => {
      const ast = engine.parseContent(String(source));
      // console.log(JSON.stringify(infer(ast), null, 2));
      expect(infer(ast)).to.eql(inference);
    });
  }
});
