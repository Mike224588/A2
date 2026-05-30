# International Student Data — Aggregated CSVs

**Sources**
- Department of Education, *International Student Data*, January 2026 release (PRISMS pivot table)
- Australian Bureau of Statistics, *3101.0 National, state and territory population*, Sep 2025 quarter, released 19 March 2026
- States/territories geometry: `au_states.geojson` (8 features, with `STATE_CODE` and `STATE_NAME` properties)

**Method**

All counts are **YTD enrolments at end of December** for each year — this represents the total course enrolments across the calendar year. Year 2026 is excluded because only January data is available in the source file.

Aggregation: a single streaming pass over the 1,291,805 source records, with measures summed across the dropped dimensions for each output. Per-capita figures use Sep-quarter 2025 ABS Estimated Resident Population as the denominator. Indexed series (`pct_of_2019`) take each state's 2019 value as 100.

**Files**

| File | Description | Rows |
| --- | --- | --- |
| `01_annual_totals.csv` | Total enrolments and commencements by year, 2019–2025 | 7 |
| `02_state_2025.csv` | Enrolments by state for 2025, with population and per-100k-residents | 8 |
| `03_state_year.csv` | Enrolments by state × year, 2019–2025 | 56 |
| `03b_state_year_indexed.csv` | Same as above plus a `pct_of_2019` index column | 56 |
| `04_nationalities_2025_all.csv` | All 194 source countries 2025, with ISO3 + UN M49 numeric `id` | 194 |
| `04b_top20_nationalities_2025.csv` | Top 20 source countries 2025, with country codes | 20 |
| `05_nat_year_stream.csv` | Top 10 countries × year (others grouped as "Other") | 77 |
| `06_sector_2025.csv` | Enrolments by education sector, 2025 | 5 |
| `07_sector_year.csv` | Enrolments by sector × year | 35 |
| `08_country_sector_heatmap.csv` | Top 15 countries × 5 sectors, 2025 | 75 |
| `09_country_field_heatmap.csv` | Top 15 countries × 13 broad fields of education, 2025 | 195 |
| `10_field_2025.csv` | Enrolments by broad field of education, 2025 | 13 |
| `11_level_of_study_2025.csv` | Enrolments by grouped AQF level, 2025 | 10 |
| `12_slope_2019_2025.csv` | Top 10 countries, 2019 vs 2025 (for slope chart) | 20 |
| `13_state_sector_2025.csv` | Enrolments by state × sector, 2025 | 40 |
| `au_states.geojson` | Australian state/territory polygons | 8 features |

Total CSV payload is ~24 KB; with the geojson, the full data download is ~680 KB.

**Joining the choropleth**

State CSV → geojson: join `state_code` to `STATE_NAME` via the lookup in `02_state_2025.csv` (or use Vega-Lite's `lookup` transform with the full state name).

World CSV → world topojson: use the `id` column (UN M49 numeric) for joining to `world-110m.json` from `vega-datasets`, or `iso3` if the topojson uses ISO-3 codes.
