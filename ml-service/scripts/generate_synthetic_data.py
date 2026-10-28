"""Generate a synthetic outbreak‑prediction dataset.

The file is saved to:
    ml-service/data/synthetic/synthetic_outbreak_training.csv

The CSV is clearly labelled as *SYNTHETIC – NOT REAL NCDC OBSERVATIONS*.
"""

import pathlib
import random

import numpy as np
import pandas as pd

# ----------------------------------------------------------------------
# Configuration (change only if you know what you’re doing)
# ----------------------------------------------------------------------
SEED = 42
N_ROWS = 10_000                     # Approx. 10 k rows
START_YEAR = 2020
END_YEAR = 2023                     # inclusive
WEEKS_PER_YEAR = 52

# Eight Northeast Indian states and a few representative districts
STATE_DISTRICTS = {
    "Assam": ["Kamrup", "Barpeta", "Hojai", "Dibrugarh"],
    "Manipur": ["Imphal West", "Imphal East", "Churachandpur"],
    "Meghalaya": ["East Khasi Hills", "West Garo Hills", "Jaintia Hills"],
    "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung"],
    "Sikkim": ["East Sikkim", "West Sikkim"],
    "Tripura": ["West Tripura", "Dhalai", "North Tripura"],
    "Arunachal Pradesh": ["Itanagar", "Papum Pare", "West Kameng"],
}

# ----------------------------------------------------------------------
# Helper functions
# ----------------------------------------------------------------------
def sample_state_and_district(rng: np.random.Generator):
    state = rng.choice(list(STATE_DISTRICTS.keys()))
    district = rng.choice(STATE_DISTRICTS[state])
    return state, district


def season_indicator(week: int) -> int:
    """Monsoon (1) for weeks 20‑38, otherwise 0."""
    return int(20 <= week <= 38)


def synthetic_row(rng: np.random.Generator, year: int, week: int):
    state, district = sample_state_and_district(rng)

    # Environmental variables – realistic ranges
    rainfall = rng.normal(loc=100, scale=60)          # mm per week
    rainfall = max(rainfall, 0)

    temperature = rng.normal(loc=24, scale=5)        # °C
    humidity = rng.uniform(40, 90)                   # %
    water_ph = rng.normal(loc=7.0, scale=0.5)        # pH
    turbidity = rng.exponential(scale=5)             # NTU
    contamination = rng.choice([0, 1], p=[0.85, 0.15])
    sanitation_risk = rng.uniform(0, 1)
    pop_density = rng.lognormal(mean=7, sigma=0.5)   # people / km²
    recent_cases = rng.poisson(lam=2)                # last 7‑day count
    hist_outbreaks = rng.poisson(lam=5)              # cumulative count
    monsoon = season_indicator(week)

    # Probabilistic outbreak generation
    log_odds = (
        -3.5                                   # baseline low prevalence
        + 0.004 * rainfall                     # more rain → higher risk
        + 2.0 * contamination                  # water contamination strong driver
        + 1.5 * sanitation_risk                # poor sanitation raises risk
        + 0.03 * turbidity                     # turbid water modest effect
        + 0.5 * monsoon                        # monsoon season boost
        - 0.001 * pop_density                  # very dense areas slightly lower risk (urban health infra)
    )
    prob = 1 / (1 + np.exp(-log_odds))
    outbreak_next_7_days = rng.binomial(1, prob)

    return {
        "state": state,
        "district": district,
        "year": year,
        "week": week,
        "rainfall_mm": round(rainfall, 1),
        "temperature_c": round(temperature, 1),
        "humidity_percent": round(humidity, 1),
        "water_ph": round(water_ph, 2),
        "turbidity_ntu": round(turbidity, 2),
        "water_contamination": int(contamination),
        "sanitation_risk_score": round(sanitation_risk, 3),
        "population_density": round(pop_density, 1),
        "recent_diarrheal_cases": int(recent_cases),
        "historical_outbreak_count": int(hist_outbreaks),
        "monsoon_indicator": int(monsoon),
        "outbreak_next_7_days": int(outbreak_next_7_days),
    }

def main():
    rng = np.random.default_rng(SEED)
    rows = []

    for year in range(START_YEAR, END_YEAR + 1):
        for week in range(1, WEEKS_PER_YEAR + 1):
            rows_per_week = max(1, N_ROWS // ((END_YEAR - START_YEAR + 1) * WEEKS_PER_YEAR))
            for _ in range(rows_per_week):
                rows.append(synthetic_row(rng, year, week))
            if len(rows) >= N_ROWS:
                break
        if len(rows) >= N_ROWS:
            break

    df = pd.DataFrame(rows[:N_ROWS])
    df["synthetic_flag"] = "SYNTHETIC – NOT REAL NCDC OBSERVATIONS"

    out_dir = pathlib.Path(__file__).resolve().parents[1] / "data" / "synthetic"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / "synthetic_outbreak_training.csv"
    df.to_csv(out_path, index=False)
    print(f"✅ Synthetic dataset written to {out_path}")
    print(f"   Rows: {df.shape[0]}, Positive label count: {df['outbreak_next_7_days'].sum()}")

if __name__ == "__main__":
    main()
