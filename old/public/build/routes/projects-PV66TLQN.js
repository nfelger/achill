import {
  require_cookies,
  require_node
} from "/build/_shared/chunk-4DZE4DDX.js";
import {
  Form,
  useLoaderData
} from "/build/_shared/chunk-65CGOSBW.js";
import {
  createHotContext
} from "/build/_shared/chunk-ETCQ6D5Z.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-7PHB3BFD.js";
import "/build/_shared/chunk-CJ4MY3PQ.js";
import "/build/_shared/chunk-JR22VO6P.js";
import {
  __toESM
} from "/build/_shared/chunk-PZDJHGND.js";

// app/routes/projects.tsx
var import_node = __toESM(require_node(), 1);
var import_cookies = __toESM(require_cookies(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/projects.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/projects.tsx"
  );
  import.meta.hot.lastModified = "1701848144982.9592";
}
var meta = () => {
  return [{
    title: "Remix Application Template"
  }, {
    name: "description",
    content: "Hello DigitalService!"
  }];
};
function Index() {
  _s();
  const {
    username
  } = useLoaderData();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("main", { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "rounded-sm bg-white px-2 py-2 shadow-md sm:w-full md:px-8 md:py-6", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("nav", { className: "border-1 w-full border-b pb-1 text-center md:text-left", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: " ", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex h-16 justify-between", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex items-center", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { src: "timetracking_blue.svg", alt: "Track-Your-Time logo", className: "p-4" }, void 0, false, {
      fileName: "app/routes/projects.tsx",
      lineNumber: 53,
      columnNumber: 17
    }, this) }, void 0, false, {
      fileName: "app/routes/projects.tsx",
      lineNumber: 52,
      columnNumber: 15
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "flex w-full items-center justify-between", children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-black", children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "font-bold", children: "Track-Your-Time" }, void 0, false, {
          fileName: "app/routes/projects.tsx",
          lineNumber: 57,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { className: "text-sm", children: [
          "Logged in as ",
          username,
          "."
        ] }, void 0, true, {
          fileName: "app/routes/projects.tsx",
          lineNumber: 58,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "app/routes/projects.tsx",
        lineNumber: 56,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Form, { method: "post", action: "/logout", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("button", { type: "submit", "data-test": "add-button", className: "inline-block h-auto rounded bg-blue-600 px-6 py-2.5 text-xs font-medium uppercase leading-tight text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg", children: "Logout" }, void 0, false, {
        fileName: "app/routes/projects.tsx",
        lineNumber: 61,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "app/routes/projects.tsx",
        lineNumber: 60,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/projects.tsx",
      lineNumber: 55,
      columnNumber: 15
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/projects.tsx",
    lineNumber: 51,
    columnNumber: 13
  }, this) }, void 0, false, {
    fileName: "app/routes/projects.tsx",
    lineNumber: 50,
    columnNumber: 11
  }, this) }, void 0, false, {
    fileName: "app/routes/projects.tsx",
    lineNumber: 49,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "app/routes/projects.tsx",
    lineNumber: 48,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/projects.tsx",
    lineNumber: 47,
    columnNumber: 10
  }, this);
}
_s(Index, "umkoAtb63ssGGbq6gS8Lx6fLNUI=", false, function() {
  return [useLoaderData];
});
_c = Index;
var _c;
$RefreshReg$(_c, "Index");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default,
  meta
};
//# sourceMappingURL=/build/routes/projects-PV66TLQN.js.map
