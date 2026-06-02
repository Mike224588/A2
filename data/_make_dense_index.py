"""Densify the per-state indexed series so the diverging area chart's
green/orange split hugs the line (areas split at the true zero crossing
instead of only at yearly vertices). Linear interpolation between the
seven yearly points, ~24 steps per year."""
import csv
from collections import defaultdict

SRC = "data/03b_state_year_indexed.csv"
OUT = "data/03c_state_indexed_dense.csv"
STEPS = 24  # sub-steps between consecutive years

rows = list(csv.DictReader(open(SRC, newline="")))
by_state = defaultdict(list)
names = {}
for r in rows:
    by_state[r["state_code"]].append((float(r["year"]), float(r["pct_of_2019"])))
    names[r["state_code"]] = r["state"]

out = []
for code, series in by_state.items():
    series.sort()
    for i in range(len(series) - 1):
        (y0, p0), (y1, p1) = series[i], series[i + 1]
        last = STEPS if i == len(series) - 2 else STEPS - 1
        for s in range(last + 1):
            t = s / STEPS
            year = y0 + (y1 - y0) * t
            pct = p0 + (p1 - p0) * t
            diff = pct - 100.0
            out.append({
                "state_code": code,
                "state": names[code],
                "year": round(year, 4),
                "pct_of_2019": round(pct, 4),
                "diff": round(diff, 4),
                "above": round(diff if diff > 0 else 0, 4),
                "below": round(diff if diff < 0 else 0, 4),
            })

with open(OUT, "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["state_code", "state", "year", "pct_of_2019", "diff", "above", "below"])
    w.writeheader()
    w.writerows(out)
print("wrote", len(out), "rows to", OUT)
