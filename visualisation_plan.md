# Visualisation Plan — Australia's International Student Map

A chart-by-chart blueprint for the FIT2179 Data Visualisation 2 submission. Each section names the data file, the chosen idiom, the marks-and-channels rationale per Munzer's framework, the story the chart carries, and the suggested annotations and interactivity.

## 1. Headline numbers

Pulled from `01_annual_totals.csv` and `02_state_2025.csv`. These are not Vega-Lite charts but rather quick-read text panels at the top of the page; they set the scale before the reader meets any visualisation.

- **1,056,653 enrolments in 2025** — up 11% on pre-COVID 2019
- **One in three came from China or India** — 38.7% combined
- **NSW and Victoria host 69%** — but per capita, the ACT is right alongside them
- **Bangladesh enrolments quadrupled** since 2019 — the fastest-growing source country

Each tile carries a one-line sparkline beneath the number, sourced from `01_annual_totals.csv` (overall) or the relevant time series. Sparklines are a minimal idiom — line marks, position-on-common-scale channel, no axes — chosen to anchor the headline number in a trajectory the reader can read at a glance without parsing axis labels.

## 2. The scale — how big has international education become?

### Chart 1. Annual line chart with policy annotations

**Data**: `01_annual_totals.csv` (year, enrolments, commencements)

**Idiom**: Annotated line chart with two series.

**Marks**: line + point + text annotations.

**Channels**: position-x for year, position-y for count, hue to separate enrolments from commencements.

**Why this idiom**: For showing change over time on a continuous quantitative variable, position-on-a-common-scale is the most accurate visual channel (Munzer's effectiveness ranking). Two series let the reader see that *commencements* (new starts) fell harder and recovered faster than *total enrolments* — the latter is a stock that lags the flow.

**Story**: The defining V-shape of the dataset. 2019 was the pre-COVID peak (952K). 2020 dipped (880K). 2021 was the floor (716K) — borders closed for almost the entire year. 2022 began the recovery (742K), 2023 surged past 2019 (969K), and 2024 set a record (1.09M). 2025 is the *first* post-pandemic dip (1.06M) — small but politically significant, coinciding with the government's enrolment-cap proposals.

**Annotations**:
- "Borders closed Mar 2020" at the 2020 point
- "Record high" at 2024
- "Enrolment caps proposed" at 2025
- Subtle band highlighting 2020–2021 to mark the COVID period

**Interactivity**: hover tooltip showing the year, enrolments, commencements, and year-on-year change.

## 3. Where they come from — the origins story

### Chart 2. World choropleth

**Data**: `04_nationalities_2025_all.csv` joined to `world-110m.json` (vega-datasets) on the UN M49 numeric `id` column.

**Idiom**: Choropleth map.

**Marks**: geo (country polygons).

**Channels**: colour (sequential ramp, log-scaled) for enrolment count; position is fixed by geography.

**Projection**: Equal Earth or Natural Earth — both preserve relative area reasonably and treat the global south fairly. Avoid Mercator, which inflates Europe and Russia.

**Why this idiom**: When the question is "where in the world?" the spatial mark is the only honest answer; any chart that puts countries in alphabetical or ranked order loses the geographic story (the dominance of Asia and the absence of most of Africa and the Middle East).

**Why log-scaled colour**: The distribution is extremely skewed — China at 227K, dozens of countries under 100 — so a linear ramp would render almost the entire map the lightest shade. Log scale spreads the long tail visibly.

**Story**: A clear "Asian crescent" from China through Southeast Asia and the subcontinent dominates the map. South America makes a visible second cluster (Colombia and Brazil). Africa is almost empty except for Kenya. Europe and North America barely register.

**Annotations**: a small inset legend explaining the log colour scale; tooltip on hover showing country name and enrolments.

### Chart 3. Lollipop chart — top 20 source countries

**Data**: `04b_top20_nationalities_2025.csv`

**Idiom**: Lollipop chart (rule + circle), horizontal.

**Marks**: rule (line) + point (circle).

**Channels**: position-y for country (sorted by enrolments), position-x for enrolment count.

**Why this idiom**: The map shows *where*; this chart shows *how much*. Position-on-a-common-scale gives precise quantitative reading that the colour ramp of the choropleth cannot. Lollipop is preferred over plain bar because it improves data-ink ratio (the long bar fill is replaced with a thin rule) without sacrificing the position channel — a small but defensible improvement per Tufte.

**Story**: A two-horse race at the top (China 227K, India 182K), then a long descent. Nepal's third-place ranking is more striking than most readers expect.

**Annotations**: number labels at the end of each lollipop; a horizontal grey rule at the median to make the top countries' dominance obvious.

**Interactivity**: optional toggle to colour-code by world region (using the Region field), turning this into a hybrid encoding.

### Chart 4. Stream graph — top 10 countries over time

**Data**: `05_nat_year_stream.csv` (top 10 countries plus "Other" as the residual)

**Idiom**: Stream graph (centred stacked area).

**Marks**: area.

**Channels**: position-x for year, length on stacked-y for enrolment count, hue for country (categorical).

**Why this idiom**: A simple stacked area or stacked bar would show absolute composition over time. A stream graph (centred baseline) emphasises *change in composition* — which is what the story is about. The reader can see China's relative share shrink even as the total grew, and the bulge of the "Other" tail expanding.

**Why not just lines**: With 11 series, individual lines would tangle. The stream pre-stacks them and lets the eye read each band's thickness.

**Story**: Through 2019–2021 China is the dominant band; by 2025 it has shrunk in *relative* terms while India, Nepal, Philippines and "Other" have all expanded. Australian international education is becoming markedly more diversified.

**Annotations**: direct labels on the thickest bands; muted grey for the residual "Other" so it visually recedes.

## 4. Where they go — the destinations story

### Chart 5. Australia choropleth — students per 100,000 residents *(REQUIRED MAP)*

**Data**: `02_state_2025.csv` joined to `au_states.geojson` on full state name.

**Idiom**: Choropleth map.

**Marks**: geo (state polygons).

**Channels**: colour (sequential ramp) for `per_100k`.

**Projection**: a Mercator or Mollweide projection bounded to Australia, or simply Vega-Lite's default `equirectangular` with a centred bounding box. A custom Albers projection optimised for Australia (used by the ABS itself) is best if you have time to set up the projection parameters.

**Why per capita, not raw counts**: Raw counts would just rank the states by population — NSW first, VIC second, all the way down to NT. The story changes once you control for population: NSW and VIC are still strong, but the ACT (with a tiny population) reaches a similar per-capita rate to VIC, and Tasmania and NT lag dramatically. This derived measure is what justifies combining the two datasets and earns the "creative/custom-built" marks.

**Story**: The headline is that the major hosting states aren't just the largest states — there's a real per-capita gap between the "international student hubs" (NSW, VIC, ACT, all near or above 4,500 per 100,000) and the periphery (TAS at 1,632, NT at 2,261).

**Annotations**: state labels directly on the map (or callouts for the smaller ACT/TAS); a colour legend; one tooltip per state showing raw count, population, and per-capita rate.

### Chart 6. Sector treemap — what they study (overview)

**Data**: `06_sector_2025.csv`

**Idiom**: Treemap, or alternatively a single 100% stacked horizontal bar.

**Marks**: rect.

**Channels**: area for enrolment count, hue for sector.

**Why this idiom**: Five categories with one of them (Higher Education) at 52% and a long tail down to Schools at 2%. A treemap makes the size disparity feel concrete; a horizontal bar shows precise percentages. Either works — treemap is more visually striking and a different idiom from the bars elsewhere on the page.

**Story**: Higher Education is the dominant sector, but VET is a serious second (34%) — much larger than most Australians realise. The sector mix shapes everything else: when politicians talk about "international students," they usually mean Higher Ed students, but a third of the cohort is doing vocational training.

### Chart 7. State × sector stacked bar

**Data**: `13_state_sector_2025.csv`

**Idiom**: 100% stacked horizontal bar (one row per state), or a grouped bar.

**Marks**: bar.

**Channels**: length for proportion or count, hue for sector, position-y for state.

**Why this idiom**: This is the bridge between sections 3 (origins) and 4 (destinations) and section 5 (the country–sector pattern). It shows that different states host different sector mixes — Tasmania and Western Australia are more VET-heavy than NSW and Victoria. That detail is invisible on the choropleth, which only shows totals.

**Story**: There is no single "international student profile" by state. NSW and VIC look like a "university city" pattern. WA, TAS, and to some extent SA look like "VET city" patterns. This sets up the next section, where we see *why* — different source countries send students into different sectors.

## 5. The pattern beneath — country × sector × field

### Chart 8. Country × Sector heatmap *(centrepiece custom chart)*

**Data**: `08_country_sector_heatmap.csv` (top 15 countries × 5 sectors)

**Idiom**: Heatmap (matrix).

**Marks**: rect.

**Channels**: position-y for country (sorted by total), position-x for sector (ordered by size), colour (sequential) for count.

**Why this idiom**: The whole point of this chart is the *pattern across two categorical dimensions*. Bars or pies for each country would force the reader to compare across many small charts. A matrix lets them scan rows and columns and *see* the cluster structure.

**Story**: This is arguably the most surprising chart in the project. Looking at the matrix:
- **Chinese students cluster in Higher Education** — 74% of Chinese enrolments are degree-level
- **Filipino students cluster in VET** — 79% in vocational education (overwhelmingly Health/aged care and Hospitality)
- **Colombian and Brazilian students** are concentrated in VET and ELICOS — a *language-then-skills* pathway
- **Indian and Nepalese students** split roughly between Higher Education and VET

"International student" is not one phenomenon — it's at least four distinct migration patterns, each tied to a different origin region and a different sector of the Australian education system.

**Annotations**: number labels inside each cell (the matrix is small enough that direct labelling works); cell borders to separate the matrix; a colour legend.

### Chart 9. Country × Broad Field of Education heatmap

**Data**: `09_country_field_heatmap.csv` (top 15 countries × 13 broad fields)

**Idiom**: Heatmap (matrix), denser than chart 8.

**Marks**: rect.

**Channels**: position-y for country, position-x for field (ordered by total), colour (sequential, log-scaled) for count.

**Why both a sector heatmap AND a field heatmap**: Sector tells you the *level* of study (degree vs trade certificate). Field tells you the *subject*. They answer different questions, and the patterns differ. Management & Commerce is the largest broad field overall but the distribution by country is *not* the same as the sector distribution — for instance, IT is heavily Indian-driven, Health draws Filipino and Nepalese students.

**Story**: Australia's international education is not just about a few countries — it is about *specific pipelines* between country and field. India + IT, Philippines + Health, China + Management and IT. Some of these pipelines mirror Australian labour shortages.

**Annotations**: a small colour-scale legend (log); muted gridlines.

### Chart 10. AQF level breakdown

**Data**: `11_level_of_study_2025.csv` (grouped levels)

**Idiom**: Horizontal bar chart.

**Marks**: bar.

**Channels**: length for count, position-y for AQF level (in qualification-hierarchy order).

**Why this idiom**: After two heatmaps, the page needs a moment of visual rest. A simple bar chart in qualification order (Doctoral at top → Schools at bottom) gives the level distribution clearly and uses a different mark from the matrix-heavy section above.

**Story**: The plurality of international students are doing Masters degrees (268K), followed by Bachelor (223K), then VET-level diplomas (150K) and Certificate III/IV (143K). PhDs are a small slice (26K), but a strategically important one for the research economy.

## 6. What changed — the recovery story

### Chart 11. Slope chart — top 10 countries, 2019 vs 2025

**Data**: `12_slope_2019_2025.csv`

**Idiom**: Slope chart (Tufte).

**Marks**: line + point + text labels at endpoints.

**Channels**: position-x for year (just two ticks: 2019, 2025), position-y for enrolments, hue to encode rise/fall (green up, red down — or single colour with up/down arrows).

**Why this idiom**: When the question is "what changed between two points?" a slope chart is more efficient than two side-by-side bars. The slope of each line is directly readable as the rate of change; the relative ranking shift is visible at a glance.

**Story**:
- Bangladesh: 7,849 → 32,477 (×4.1) — the breakout story
- Pakistan: ×1.7. Philippines: ×2.3. Vietnam: ×1.4. Colombia: ×1.3. Indonesia: ×1.4
- India: ×1.3 — solid growth
- Nepal: ×1.3 — continued strength
- **China: ↓ to 87% of 2019** — has not recovered to pre-COVID peak
- **Brazil: ↓ to 74% of 2019** — the only top-10 country with a sustained decline

**Annotations**: percentage-change labels at the 2025 endpoint of each line; growth countries in green, decliners in red or grey.

### Chart 12. Small multiples — state recovery indexed to 2019

**Data**: `03b_state_year_indexed.csv`

**Idiom**: Small multiples (one panel per state, all on identical axes), line chart inside each panel.

**Marks**: line + reference line at y=100 (the 2019 baseline).

**Channels**: position-x for year, position-y for `pct_of_2019`, faceting (small multiples) for state.

**Why this idiom**: Eight states on one combined line chart would be a tangle. Small multiples with synchronised axes let the reader compare *shapes* across states — the V-curve depth, the recovery slope, the eventual ceiling — without forcing them to disentangle overlapping lines. This is exactly the use case Tufte introduced small multiples for.

**Why indexed to 2019, not raw counts**: This is a comparative chart, not an absolute-counts chart. NSW with 400K students would dwarf NT with 6K on a raw scale, hiding the *shape* of NT's recovery. Indexing puts every state on the same scale and makes the shapes directly comparable.

**Story**: Six states overshot their 2019 baseline by 2024. NSW only reaches 110% — its recovery is real but modest. The ACT was the fastest mover during the COVID recovery. Tasmania's curve is the shallowest. WA has the most dramatic peak (driven by VET demand into mining and trades).

**Annotations**: dashed horizontal reference line at 100% on every panel; year axis ticks at 2019 and 2025 only to reduce clutter.

## Overall design notes

### Layout

A single column, full width on a small laptop (the assignment requires no horizontal scrolling). Hero block → six numbered story sections → footer. Each section opens with a short prose paragraph and one or two charts. Charts within a section align to a consistent left-right grid: where two charts sit side by side, they share a baseline and equal height.

White space between sections should be generous (about double the in-section spacing) — this is how the reader knows a new beat has started.

### Typography

One sans-serif body face (Inter, IBM Plex Sans, or Source Sans Pro are good public options) at 16–17 px, line height 1.55. One serif or distinctive sans for headlines (e.g., a humanist sans like Söhne or Atkinson Hyperlegible if you want something less corporate). Tabular numerals for any inline figures.

Avoid: more than two type families; ALL CAPS body text; centred body paragraphs; line lengths longer than ~80 characters.

### Colour

Pick a single sequential ramp for *all* quantitative encodings (e.g., a viridis variant or a custom warm-monochrome ramp). Reusing the same ramp across charts is one of the strongest visual-hierarchy cues you have — it tells the reader "this is the same kind of quantity."

Use categorical hue sparingly: for the five sectors (Higher Ed / VET / ELICOS / Schools / Non-award) pick one categorical palette and use it consistently across charts 6, 7, and any other sector-coloured chart. Same for the top-10 countries in the stream graph and slope chart — use the *same* colour for each country across both charts so the reader carries the association from one to the other.

Do **not** use hue to encode order or magnitude; use it for category only. Use the sequential ramp for magnitude.

### Interactivity

Restrained tooltips on every chart (year/country/value at minimum). One or two charts can have a year filter or country filter — the lollipop in particular could be drillable by world region — but resist building a dashboard. The assignment is presentation, not exploration.

## Idiom inventory — Munzer mapping

The page deliberately spans a broad set of idiom families to demonstrate range. By Munzer's *What/Why/How* framework:

| Idiom | Marks | Channels | Charts using it |
| --- | --- | --- | --- |
| Sparkline | line | position | KPI cards (×4) |
| Annotated line chart | line, point, text | position-on-common-scale | Chart 1 |
| Choropleth (geographic) | area (region) | colour (sequential) | Charts 2, 5 |
| Lollipop chart | rule, point | position, length | Chart 3 |
| Stream graph (stacked area) | area | position, stack length, hue | Chart 4 |
| Treemap | rect (nested) | area, hue | Chart 6 |
| Stacked bar | rect | length, hue, position | Chart 7 |
| Heatmap (matrix) | rect | position×position, colour | Charts 8, 9 |
| Horizontal bar | rect | length, position | Chart 10 |
| Slope chart | line, point, text | position-on-common-scale | Chart 11 |
| Small multiples | (line, faceted) | position + faceting | Chart 12 |

Eleven distinct idiom families across twelve charts plus the KPI cards — comfortably meeting "a substantial number of different idioms" and avoiding repetition.

## Charts that count as "custom-built / derived" (for HD criteria)

The rubric rewards "creative and custom-built visualisations" requiring derived data. Five charts qualify:

1. **Chart 5 — per-100k choropleth**: combines two datasets (Department of Education + ABS); requires explicit per-capita derivation.
2. **Chart 8 — country × sector heatmap**: derived cross-tab not directly available in either source.
3. **Chart 9 — country × field heatmap**: another derived cross-tab.
4. **Chart 11 — slope chart with growth multipliers**: derived comparison plus ratio computation.
5. **Chart 12 — indexed small multiples**: derived `pct_of_2019` measure.

## Implementation order

If you build in this order, you get something visible quickly and de-risk the hardest parts early:

1. Chart 1 (line chart) — simplest, gives you a working Vega-Lite scaffold
2. Chart 5 (Australia choropleth) — tackle the required map second, while you have energy for the projection setup
3. Chart 2 (world choropleth) — same pattern as chart 5, easier the second time
4. Chart 3 (lollipop) and Chart 10 (bar) — quick wins
5. Chart 6 (treemap) and Chart 7 (stacked bar) — sector layer
6. Charts 8 and 9 (heatmaps) — the centrepiece custom charts
7. Chart 4 (stream graph) — Vega-Lite supports this via `transform: stack` with `offset: "center"`
8. Charts 11 and 12 (slope, small multiples) — finishing touches
9. KPI cards — last, once you've decided the headline numbers

Save the Vega-Lite JSON for each chart as a separate file in your repo (`vega/01_annual.json`, `vega/05_choropleth.json`, etc.) and embed them via `vegaEmbed`. The assignment explicitly requires the JSON to be human-readable and accessible in the repo.

## What to write in the 500-word brief

Lead with the *why*: this dataset is in the political conversation right now, and most readers don't see the underlying pattern. Lead with the *what*: Department of Education + ABS, combined, recent. Lead with the *how*: idioms matched to questions — geography for the spatial questions, time series for the trend, heatmaps for the cross-cuts.

Mention your personal connection honestly — being at Monash, in a city built around international education, is a legitimate "why this matters to me" hook and the rubric rewards it.
