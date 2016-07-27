import { htmlElementFragments, htmlTextFragment, htmlCommentFragment, HTMLElementEntity } from "./index";
import { EntityEngine } from "sf-core/entities";
import { parse as parseHTML } from "../../parsers/html";
import { FragmentDictionary } from "sf-core/fragments";
import { expect } from "chai";

describe(__filename + "#", function() {
  let fragments;
  beforeEach(function() {
    fragments = new FragmentDictionary(
      ...htmlElementFragments,
      htmlTextFragment,
      htmlCommentFragment
    );
  });

  it("can render a DIV element", async function() {
    const engine = new EntityEngine(fragments);
    const entity = await engine.load(parseHTML("<div />"));
    expect(entity.nodeName).to.equal("DIV");
  });

  it("emits a DOM element", async function() {
    const engine = new EntityEngine(fragments);
    let source = "<div>hello world!</div>";
    const entity = await engine.load(parseHTML(source)) as HTMLElementEntity;
    const div = document.createElement("div");
    div.appendChild(entity.section.toFragment());
    expect(div.innerHTML).to.equal(source);
  });

  [
    ["<div>hello</div>", "<div>world</div>"],
    ["<div><h1>hello</h1></div>", "<div>world</div>"],
    [`<div id="a"></div>`, `<div></div>`],
    [`<div id="a"></div>`, `<div id="a"></div>`],
    [`<div></div>`, `<div id="a"></div>`],

    // shuffle
    [`<div><h1>1</h1><h2>2</h2><h3>2</h3></div>`, `<div><h3>1</h3><h2>2</h2><h1>3</h1></div>`],
    [`<div>1<h2>2</h2>3<h3>4</h3></div>`, `<div><h2>1</h2>2<h3>3</h3></div>`]
  ].forEach(function([source, change]) {
    it(`can update the source from ${source} to ${change}`, async function() {
      const engine = new EntityEngine(fragments);
      const entity = await engine.load(parseHTML(source as any)) as HTMLElementEntity;
      const div = document.createElement("div");
      div.appendChild(entity.section.toFragment());
      expect(div.innerHTML).to.equal(source);
      await engine.load(parseHTML(change as any));
      expect(div.innerHTML).to.equal(change);
    })
  })
});