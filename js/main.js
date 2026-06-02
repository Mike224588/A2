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

/* ------------------------------------------------------------------ *
 * Country -> field-of-study Sankey (d3-sankey).
 *
 * This is the one figure Vega-Lite cannot express, so it is rendered
 * with d3-sankey. To keep the spaghetti down we keep only each country's
 * three largest field flows (~45 ribbons total), which is exactly the
 * pipeline insight we want to show.
 * ------------------------------------------------------------------ */
const SANKEY_TOP_N = 3;
const SANKEY_TOP_COUNTRIES = 10;
const SANKEY_EXCLUDE_FIELDS = ["_Dual Qualification"];

// Okabe–Ito palette: no red–green pairs (hard to tell apart for many colour-blind readers).
const FIELD_COLORS = {
  "Management and Commerce": "#0072B2",
  "Information Technology": "#D55E00",
  "Engineering and Related Technologies": "#E69F00",
  "Society and Culture": "#CC79A7",
  "Food, Hospitality and Personal Services": "#F0E442",
  "Mixed Field Programmes": "#56B4E9",
  "Health": "#882255",
  "Education": "#999933",
  "Architecture and Building": "#BBBBBB",
  "Natural and Physical Sciences": "#009E73",
  "Creative Arts": "#AA4499",
  "Agriculture, Environmental and Related Studies": "#DDCC77"
};
const FIELD_FALLBACK = "#9aa8b5";

// Shorter labels keep the right column legible; tooltips keep the full name.
// "\n" forces a line break (rendered as tspans).
const FIELD_SHORT = {
  "Management and Commerce": "Management &\nCommerce",
  "Information Technology": "IT",
  "Engineering and Related Technologies": "Engineering",
  "Health": "Health",
  "Society and Culture": "Society & Culture",
  "Food, Hospitality and Personal Services": "Food & Hospitality",
  "Education": "Education",
  "Architecture and Building": "Architecture",
  "Natural and Physical Sciences": "Sciences",
  "Creative Arts": "Creative Arts",
  "Mixed Field Programmes": "Mixed Field",
  "Agriculture, Environmental and Related Studies": "Agriculture"
};

function fieldColor(name) {
  return FIELD_COLORS[name] || FIELD_FALLBACK;
}

function fieldLabel(name) {
  return FIELD_SHORT[name] || name;
}

async function renderSankey() {
  const el = document.getElementById("sankey-country-field");
  if (!el) return;
  if (!window.d3 || !d3.sankey) {
    el.innerHTML =
      '<p class="chart-error">The flow diagram needs the d3-sankey library, ' +
      "which could not be loaded.</p>";
    return;
  }

  const src = el.getAttribute("data-src");
  let raw;
  try {
    raw = await d3.csv(src, (d) => ({
      country: d.nationality,
      field: d.field,
      value: +d.enrolments
    }));
  } catch (err) {
    console.error("Failed to load sankey data", src, err);
    el.innerHTML =
      '<p class="chart-error">Could not load the flow data (' + src + ").</p>";
    return;
  }

  const rows = raw.filter(
    (d) => d.value > 0 && !SANKEY_EXCLUDE_FIELDS.includes(d.field)
  );

  // Keep each country's top-N fields; order countries by total enrolments
  // and keep only the largest source countries so the diagram stays legible.
  let byCountry = d3.groups(rows, (d) => d.country);
  const countryTotals = new Map(
    byCountry.map(([c, arr]) => [c, d3.sum(arr, (d) => d.value)])
  );
  byCountry.sort((a, b) => countryTotals.get(b[0]) - countryTotals.get(a[0]));
  byCountry = byCountry.slice(0, SANKEY_TOP_COUNTRIES);

  const flows = [];
  byCountry.forEach(([country, arr]) => {
    arr
      .slice()
      .sort((a, b) => b.value - a.value)
      .slice(0, SANKEY_TOP_N)
      .forEach((d) => flows.push({ country, field: d.field, value: d.value }));
  });

  drawSankey(el, flows, byCountry.map((d) => d[0]));

  // Re-render responsively on width change (debounced).
  if (!el.__sankeyResizeBound) {
    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => drawSankey(el, flows, byCountry.map((d) => d[0])), 150);
    });
    ro.observe(el);
    el.__sankeyResizeBound = true;
  }
}

function drawSankey(el, flows, countryOrder) {
  const width = Math.max(el.clientWidth || 680, 320);
  const rowH = 52;
  const headerH = 30;
  const height = Math.max(countryOrder.length * rowH, 360) + headerH;
  const margin = { top: headerH + 6, right: 150, bottom: 10, left: 96 };

  // Build node + link arrays with stable indices.
  const countryNodes = countryOrder.map((c) => "C:" + c);
  const fieldOrder = [];
  flows.forEach((f) => {
    if (!fieldOrder.includes(f.field)) fieldOrder.push(f.field);
  });
  // Order fields by total inbound value for a tidy right column.
  const fieldTotals = new Map();
  flows.forEach((f) =>
    fieldTotals.set(f.field, (fieldTotals.get(f.field) || 0) + f.value)
  );
  fieldOrder.sort((a, b) => fieldTotals.get(b) - fieldTotals.get(a));
  const fieldNodes = fieldOrder.map((f) => "F:" + f);

  const names = countryNodes.concat(fieldNodes);
  const index = new Map(names.map((n, i) => [n, i]));
  const nodes = names.map((n) => ({ name: n }));
  const links = flows.map((f) => ({
    source: index.get("C:" + f.country),
    target: index.get("F:" + f.field),
    value: f.value,
    field: f.field,
    country: f.country
  }));

  const sankey = d3
    .sankey()
    .nodeWidth(12)
    .nodePadding(13)
    .nodeSort(null)
    .extent([
      [margin.left, margin.top],
      [width - margin.right, height - margin.bottom]
    ]);

  const graph = sankey({
    nodes: nodes.map((d) => Object.assign({}, d)),
    links: links.map((d) => Object.assign({}, d))
  });

  el.innerHTML = "";
  const svg = d3
    .select(el)
    .append("svg")
    .attr("class", "sankey-svg")
    .attr("width", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin meet");

  // Column headers.
  svg
    .append("text")
    .attr("class", "sankey-header")
    .attr("x", margin.left)
    .attr("y", 18)
    .attr("text-anchor", "start")
    .text("Source country");
  svg
    .append("text")
    .attr("class", "sankey-header")
    .attr("x", width - margin.right)
    .attr("y", 18)
    .attr("text-anchor", "end")
    .text("Field of study");

  // Links.
  const link = svg
    .append("g")
    .attr("fill", "none")
    .selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("class", "sankey-link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("stroke", (d) => fieldColor(d.field))
    .attr("stroke-width", (d) => Math.max(1.5, d.width));

  link
    .append("title")
    .text(
      (d) =>
        d.country +
        " \u2192 " +
        d.field +
        "\n" +
        d3.format(",")(d.value) +
        " students"
    );

  // Nodes.
  const node = svg
    .append("g")
    .selectAll("g")
    .data(graph.nodes)
    .join("g");

  node
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("height", (d) => Math.max(1, d.y1 - d.y0))
    .attr("width", (d) => d.x1 - d.x0)
    .attr("class", (d) =>
      d.name.startsWith("C:") ? "sankey-node sankey-node-country" : "sankey-node sankey-node-field"
    )
    .attr("fill", (d) =>
      d.name.startsWith("F:") ? fieldColor(d.name.slice(2)) : "#0a2540"
    )
    .style("cursor", "pointer")
    .on("click", (event, d) => {
      event.stopPropagation();
      toggleNode(d);
    });

  // Labels (support multi-line via "\n").
  node
    .append("text")
    .attr("class", "sankey-label")
    .attr("x", (d) => (d.name.startsWith("C:") ? d.x0 - 8 : d.x1 + 8))
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("text-anchor", (d) => (d.name.startsWith("C:") ? "end" : "start"))
    .each(function (d) {
      const isCountry = d.name.startsWith("C:");
      const label = isCountry ? d.name.slice(2) : fieldLabel(d.name.slice(2));
      const lines = String(label).split("\n");
      const t = d3.select(this);
      const startDy = -((lines.length - 1) / 2) * 1.1 + 0.35;
      lines.forEach((line, i) => {
        t.append("tspan")
          .attr("x", isCountry ? d.x0 - 8 : d.x1 + 8)
          .attr("dy", (i === 0 ? startDy : 1.1) + "em")
          .text(line);
      });
    });

  let selected = null;
  function toggleNode(d) {
    selected = selected === d ? null : d;
    if (!selected) {
      clearHighlight();
      return;
    }
    link.classed("is-dim", (l) => l.source !== selected && l.target !== selected);
    link.classed("is-active", (l) => l.source === selected || l.target === selected);
  }
  function clearHighlight() {
    link.classed("is-dim", false).classed("is-active", false);
  }
  // Click empty space to clear the selection.
  svg.on("click", () => {
    selected = null;
    clearHighlight();
  });
}

/* ------------------------------------------------------------------ *
 * Qualification treemap (d3.treemap).
 *
 * Another idiom Vega-Lite cannot express. Qualifications are grouped
 * into four pathway tiers; each tier is a fixed cell (rows of equal
 * height, columns split by tier total) with its qualifications laid
 * out as a per-tier treemap. The headline insight: the three big
 * tiers are nearly equal in size.
 * ------------------------------------------------------------------ */
const TREEMAP_TIER_ORDER = [
  "Postgraduate",
  "Vocational",
  "Undergraduate",
  "English & Schools"
];
const TREEMAP_TIER_COLORS = {
  Postgraduate: "#15365c",
  Vocational: "#c2741c",
  Undergraduate: "#2f6aa0",
  "English & Schools": "#6e7a88"
};

/** Lay out qualifications inside a tier cell; stack vertically when one slice is too narrow. */
function layoutTierLeaves(quals, cellW, cellH) {
  const pad = 3;
  const sorted = quals
    .slice()
    .sort((a, b) => b.value - a.value)
    .map((d) => ({
      qualification: d.qualification,
      value: d.value
    }));
  const sum = d3.sum(sorted, (d) => d.value);
  const minBand = 58;

  function box(d, x0, y0, x1, y1) {
    return {
      qualification: d.qualification,
      value: d.value,
      x0: x0,
      y0: y0,
      x1: Math.min(x1, cellW),
      y1: Math.min(y1, cellH)
    };
  }

  // Two qualifications: if the smaller would be a unreadable vertical sliver, stack.
  if (sorted.length === 2) {
    const small = sorted[1];
    const smallShare = small.value / sum;
    if (smallShare < 0.22 || cellW * smallShare < 80) {
      const smallH = Math.max(minBand, (cellH * small.value) / sum);
      const bigH = cellH - smallH - pad;
      return [
        box(sorted[0], 0, 0, cellW, bigH),
        box(sorted[1], 0, bigH + pad, cellW, cellH)
      ];
    }
  }

  // Three or more: reserve a readable band for any tiny slice (< 2% of tier).
  const tiny = sorted.filter((d) => d.value / sum < 0.02);
  if (tiny.length > 0 && sorted.length >= 3) {
    const big = sorted.filter((d) => d.value / sum >= 0.02);
    const tinyH = tiny.length * minBand + pad * (tiny.length - 1);
    const bigH = cellH - tinyH - (big.length > 0 ? pad : 0);
    const out = [];
    let y = 0;
    if (big.length > 0) {
      const bigSum = d3.sum(big, (d) => d.value);
      let x = 0;
      big.forEach((d, i) => {
        const w =
          i === big.length - 1
            ? cellW - x
            : (cellW * d.value) / bigSum;
        out.push(box(d, x, 0, x + w, bigH));
        x += w + pad;
      });
      y = bigH + pad;
    }
    tiny.forEach((d, i) => {
      out.push(box(d, 0, y, cellW, y + minBand));
      y += minBand + (i < tiny.length - 1 ? pad : 0);
    });
    return out;
  }

  // Default squarified treemap.
  const root = d3
    .hierarchy({ children: sorted })
    .sum((d) => d.value)
    .sort((a, b) => b.value - a.value);
  d3
    .treemap()
    .size([cellW, cellH])
    .paddingInner(pad)
    .round(true)(root);
  return root.leaves().map((d) =>
    box(d.data, d.x0, d.y0, d.x1, d.y1)
  );
}

async function renderTreemap() {
  const el = document.getElementById("treemap-pathways");
  if (!el) return;
  if (!window.d3 || !d3.treemap) {
    el.innerHTML =
      '<p class="chart-error">The treemap needs the d3 library, which could not be loaded.</p>';
    return;
  }

  const src = el.getAttribute("data-src");
  let raw;
  try {
    raw = await d3.csv(src, (d) => ({
      tier: d.tier,
      tierOrder: +d.tier_order,
      qualification: d.qualification,
      value: +d.enrolments
    }));
  } catch (err) {
    console.error("Failed to load treemap data", src, err);
    el.innerHTML =
      '<p class="chart-error">Could not load the pathway data (' + src + ").</p>";
    return;
  }

  // Cert I/II is omitted: too few students to show fairly in a tier treemap.
  const rows = raw.filter(
    (d) => d.value > 0 && d.qualification !== "Cert I/II"
  );
  drawTreemap(el, rows);

  if (!el.__treemapResizeBound) {
    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => drawTreemap(el, rows), 150);
    });
    ro.observe(el);
    el.__treemapResizeBound = true;
  }
}

function drawTreemap(el, rows) {
  const width = Math.max(el.clientWidth || 720, 320);
  const stacked = width < 640;
  const height = stacked ? 760 : 520;
  const gap = 14;
  const headerH = 30;

  const total = d3.sum(rows, (d) => d.value);
  const byTier = d3.groups(rows, (d) => d.tier);
  const tierTotals = new Map(
    byTier.map(([t, arr]) => [t, d3.sum(arr, (d) => d.value)])
  );

  // Cell rectangle per tier. Top: Postgraduate + English & Schools; bottom: Vocational + Undergraduate.
  const rows2 = [
    ["Postgraduate", "English & Schools"],
    ["Vocational", "Undergraduate"]
  ];
  const cells = new Map();
  if (stacked) {
    // One tier per row, full width.
    const rowH = (height - gap * (TREEMAP_TIER_ORDER.length - 1)) /
      TREEMAP_TIER_ORDER.length;
    TREEMAP_TIER_ORDER.forEach((tier, i) => {
      cells.set(tier, { x: 0, y: i * (rowH + gap), w: width, h: rowH });
    });
  } else {
    const rowH = (height - gap) / 2;
    rows2.forEach((pair, r) => {
      const pairTotal = d3.sum(pair, (t) => tierTotals.get(t));
      let x = 0;
      pair.forEach((tier, c) => {
        const w =
          ((width - gap) * tierTotals.get(tier)) / pairTotal;
        cells.set(tier, { x: x, y: r * (rowH + gap), w: w, h: rowH });
        x += w + gap;
      });
    });
  }

  el.innerHTML = "";
  const svg = d3
    .select(el)
    .append("svg")
    .attr("class", "treemap-svg")
    .attr("width", "100%")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin meet");

  TREEMAP_TIER_ORDER.forEach((tier) => {
    const cell = cells.get(tier);
    if (!cell) return;
    const color = TREEMAP_TIER_COLORS[tier] || "#445";
    const tierTotal = tierTotals.get(tier);
    const pct = Math.round((tierTotal / total) * 100);
    const g = svg
      .append("g")
      .attr("transform", "translate(" + cell.x + "," + cell.y + ")");

    // Header band.
    g.append("rect")
      .attr("class", "treemap-headbar")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", cell.w)
      .attr("height", headerH)
      .attr("fill", color);
    g.append("text")
      .attr("class", "treemap-headtext")
      .attr("x", 12)
      .attr("y", headerH / 2)
      .attr("dy", "0.35em")
      .text(
        tier.toUpperCase() +
          "  \u00b7  " +
          Math.round(tierTotal / 1000) +
          "k  \u00b7  " +
          pct +
          "%"
      );

    // Per-tier layout for qualifications (custom when a slice would be too narrow).
    const quals = byTier.find((d) => d[0] === tier)[1];
    const innerH = cell.h - headerH;
    const leaves = layoutTierLeaves(quals, cell.w, innerH);
    const tierKey = tier.replace(/[^a-z]/gi, "");

    const leaf = g
      .append("g")
      .attr("transform", "translate(0," + headerH + ")")
      .selectAll("g")
      .data(leaves)
      .join("g")
      .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");

    leaf
      .append("rect")
      .attr("class", "treemap-leaf")
      .attr("width", (d) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d) => Math.max(0, d.y1 - d.y0))
      .attr("fill", color);

    leaf
      .append("title")
      .text(
        (d) =>
          d.qualification +
          "\n" +
          d3.format(",")(d.value) +
          " students"
      );

    const defs = g.append("defs");
    leaf.each(function (d, i) {
      const lw = d.x1 - d.x0;
      const lh = d.y1 - d.y0;
      defs
        .append("clipPath")
        .attr("id", "clip-" + tierKey + "-" + i)
        .append("rect")
        .attr("width", Math.max(0, lw - 2))
        .attr("height", Math.max(0, lh - 2));
    });

    leaf.each(function (d, i) {
      const w = d.x1 - d.x0;
      const h = d.y1 - d.y0;
      const qual = (d.qualification || "").trim();
      if (!qual || w < 36 || h < 26) return;
      const clipId = "clip-" + tierKey + "-" + i;
      const sel = d3.select(this);
      const words = qual.split(" ");
      const useTwoLines = words.length > 1 && w < 120;
      const midWord = Math.ceil(words.length / 2);
      const line1 = useTwoLines ? words.slice(0, midWord).join(" ") : qual;
      const line2 = useTwoLines ? words.slice(midWord).join(" ") : null;
      const stacked = h < 52;
      const nameY = stacked ? 14 : h >= 48 ? 16 : Math.max(14, h / 2 - 4);
      const showValue = h >= 40;
      const tg = sel.append("g").attr("clip-path", "url(#" + clipId + ")");
      const tspan = tg
        .append("text")
        .attr("class", "treemap-qual")
        .attr("x", 10)
        .attr("y", nameY);
      tspan.append("tspan").attr("x", 10).attr("dy", "0").text(line1);
      if (line2) {
        tspan.append("tspan").attr("x", 10).attr("dy", "1.2em").text(line2);
      }
      if (showValue) {
        const valSize = h < 52 ? "treemap-value treemap-value-sm" : "treemap-value";
        tg.append("text")
          .attr("class", valSize)
          .attr("x", 10)
          .attr("y", nameY + (line2 ? 38 : stacked ? 26 : 28))
          .text(d3.format(",")(d.value));
      }
    });
  });
}

function init() {
  warnIfFileProtocol();
  renderAll();
  renderSankey();
  renderTreemap();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}