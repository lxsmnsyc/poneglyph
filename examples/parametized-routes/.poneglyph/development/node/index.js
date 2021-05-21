var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// pages/[message].tsx
var import_poneglyph = __toModule(require("poneglyph"));
var import_react = __toModule(require("react"));
var getPageData = (ctx) => ({
  type: "success",
  value: {
    message: ctx.params.message
  }
});
function Example() {
  const { message } = (0, import_poneglyph.usePageData)();
  return /* @__PURE__ */ import_react.default.createElement("main", null, /* @__PURE__ */ import_react.default.createElement(import_poneglyph.Head, null, /* @__PURE__ */ import_react.default.createElement("title", null, `Hello ${message}`)), /* @__PURE__ */ import_react.default.createElement("h1", null, `Hello ${message}`));
}

// .poneglyph/development/tmp.node/index.tsx
var import_poneglyph2 = __toModule(require("poneglyph"));
var import_http = __toModule(require("http"));
var globalConfig = {
  buildDir: ".poneglyph\\development\\browser"
};
var _a;
var pages = [{
  path: "/[message]",
  resourceID: "0",
  entrypoint: "[message]",
  Component: Example,
  getPageData: (_a = getPageData) != null ? _a : void 0
}];
import_http.default.createServer((0, import_poneglyph2.createServer)(globalConfig, pages)).listen(3e3);
//# sourceMappingURL=index.js.map
