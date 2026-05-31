/*
 * Embeds every Vega-Lite specification referenced by a [data-spec] element.
 * A single shared theme keeps typography, colour and axis styling consistent
 * across all charts, while each spec lives in its own human-readable JSON file
 * under charts/ (linked beneath every figure).
 */

const VEGA_THEME = {
  background: "transparent",
  font: "Inter, system-ui, sans-serif",
  title: {
    font: "Fraunces, Georgia, serif",
    fontSize: 15,
    fontWeight: 600,
    anchor: "start",
    color: "#16302d",
    subtitleColor: "#5b6663",
    offset: 12
  },
  axis: {
    labelFont: "Inter, sans-serif",
    titleFont: "Inter, sans-serif",
    titleFontWeight: 600,
    titleColor: "#34403d",
    labelColor: "#5b6663",
    labelFontSize: 11,
    titleFontSize: 12,
    domainColor: "#cfd6d3",
    tickColor: "#cfd6d3",
    gridColor: "#eee9df",
    titlePadding: 8
  },
  legend: {
    labelFont: "Inter, sans-serif",
    titleFont: "Inter, sans-serif",
    titleColor: "#34403d",
    labelColor: "#5b6663",
    labelFontSize: 11,
    titleFontSize: 12,
    titleFontWeight: 600
  },
  view: { stroke: "transparent" }
};

const EMBED_OPTIONS = {
  config: VEGA_THEME,
  actions: false,
  renderer: "canvas",
  tooltip: { theme: "light" }
};

function warnIfFileProtocol() {
  if (location.protocol !== "file:") return;
  const banner = document.createElement("p");
  banner.setAttribute("role", "alert");
  banner.className = "file-protocol-warning";
  banner.innerHTML =
    "<strong>Charts will not load from a saved file.</strong> " +
    "From the project folder run <code>python -m http.server 8123</code>, " +
    "then open <code>http://localhost:8123/</code> in your browser.";
  document.body.prepend(banner);
}

function renderAll() {
  const nodes = document.querySelectorAll(".viz[data-spec]");
  nodes.forEach((el) => {
    const spec = el.getAttribute("data-spec");
    vegaEmbed(el, spec, EMBED_OPTIONS).catch((err) => {
      console.error("Failed to render", spec, err);
      el.innerHTML =
        '<p class="chart-error">' +
        "This chart could not be loaded. Use a local web server " +
        "(<code>python -m http.server 8123</code>) and open " +
        "<code>http://localhost:8123/</code> — not a file:// link. " +
        "(" + spec + ")</p>";
    });
  });
}

function init() {
  warnIfFileProtocol();
  renderAll();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
