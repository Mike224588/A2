# Australia's International Students — Where They Come From, Where They Study

An interactive data story built for **FIT2179 Data Visualisation 2** (Monash University, 2026).
It follows international students in Australia from their countries of origin, to the states and
sectors where they study, to how the pattern changed after the pandemic.

**Author:** [Your Name] · **Created:** May 2026

> Replace `[Your Name]` here and in the footer of `index.html` before submitting.

## View it

The site is a single static page. To run it locally you need a small web server (the charts load
data files with `fetch`, which does not work from a `file://` URL):

```bash
python -m http.server 8000
# then open http://localhost:8000
```

For submission, enable **GitHub Pages** on this repository (Settings → Pages → deploy from the
`main` branch, root folder). The site will be served from `https://<username>.github.io/<repo>/`.

## What / Why / Who / How

- **Why:** International education is one of Australia's largest exports and shapes its biggest
  cities, yet the underlying patterns (who comes, where they go, what they study) are rarely shown.
- **What:** Course enrolments and commencements, by country, state, sector, field and qualification
  level, 2019–2025.
- **Who:** A general Australian audience. Jargon and statistical assumptions are avoided; where a
  log scale is used it is labelled and explained in the surrounding text.
- **How:** Each question is matched to an idiom — maps for the geographic questions, a time series
  for the trend, heatmaps for the country × sector / field cross-cuts, and a slope chart and small
  multiples for change over time.

## Data sources (two combined sources)

| Source | Used for |
| --- | --- |
| Department of Education, *International Student Data* (January 2026 release) | All enrolment, commencement, country, sector, field and level figures |
| Australian Bureau of Statistics, *National, state and territory population* (Sep 2025 quarter) | Resident population, used to derive the per-100,000 map |
| vega-datasets `world-110m` | World country boundaries for the origin choropleth |

Per-capita figures, the country × sector and country × field cross-tabs, and the indexed state
series are **derived** by combining the sources above.

## Repository structure

```
index.html              The single-page visualisation
css/style.css           Layout, typography and colour
js/main.js              Shared Vega-Lite theme + chart embedding
charts/                 One human-readable Vega-Lite JSON spec per chart
data/                   Aggregated CSVs + au_states.geojson (served to the charts)
intl_students_data/     Source aggregation and data README
visualisation_plan.md   The chart-by-chart design blueprint
```

## Visualisations

| # | File | Idiom |
| --- | --- | --- |
| KPI | `charts/kpi_*.json` | Sparklines and micro stacked bars |
| 1 | `charts/01_annual_line.json` | Annotated line chart |
| 2 | `charts/02_world_choropleth.json` | World choropleth map (Equal Earth, log) |
| 3 | `charts/03_lollipop_top_countries.json` | Lollipop chart |
| 4 | `charts/04_stream_countries.json` | Stream graph |
| 5 | `charts/05_australia_choropleth.json` | Australia choropleth map (per 100,000) |
| 6 | `charts/06_sector_donut.json` | Donut chart |
| 7 | `charts/07_state_sector_stacked.json` | 100% stacked bar |
| 8 | `charts/08_country_sector_heatmap.json` | Heatmap |
| 9 | `charts/09_country_field_heatmap.json` | Heatmap (log) |
| 10 | `charts/10_aqf_levels.json` | Horizontal bar chart |
| 11 | `charts/11_slope_2019_2025.json` | Slope chart |
| 12 | `charts/12_small_multiples_states.json` | Small multiples |

All diagrams and maps are built with **Vega-Lite** only, per the assignment's library restriction.

## AI acknowledgement

Generative AI was used for planning, drafting the narrative text, and code assistance. All data
aggregation and design decisions are the author's own.
