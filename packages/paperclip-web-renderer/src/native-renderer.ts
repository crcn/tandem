import { stringifyCSSSheet } from "./stringify-sheet";
import { Html5Entities } from "html-entities";

const entities = new Html5Entities();

export const createNativeNode = node => {
  // return document.createTextNode("OK");
  switch (node.type) {
    case "Text":
      return createNativeTextNode(node);
    case "Element":
      return createNativeElement(node);
    case "StyleElement":
      return createNativeStyle(node);
    case "Fragment":
      return createNativeFragment(node);
  }
};

const createNativeTextNode = node => {
  return document.createTextNode(entities.decode(node.value));
};
const createNativeStyle = element => {
  // return document.createTextNode(JSON.stringify(element));
  const nativeElement = document.createElement("style");
  nativeElement.textContent = stringifyCSSSheet(element.sheet);
  return nativeElement;
};

const createNativeElement = element => {
  const nativeElement = document.createElement(element.tag_name);
  for (const { name, value } of element.attributes) {
    nativeElement.setAttribute(name, value);
  }
  for (const child of element.children) {
    nativeElement.appendChild(createNativeNode(child));
  }
  return nativeElement;
};

const createNativeFragment = fragment => {
  const nativeFragment = document.createDocumentFragment();
  for (const child of fragment.children) {
    nativeFragment.appendChild(createNativeNode(child));
  }
  return nativeFragment;
};