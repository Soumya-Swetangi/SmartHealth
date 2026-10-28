import pandas as pd
from pathlib import Path

RAW_PROCESSED = Path(__file__).parent.parent / "data" / "processed"
CLEANED_PATH = RAW_PROCESSED / "idsp_waterborne_northeast.csv"

# List of Northeastern states
NE_STATES = [
    "Assam",
    "Arunachal Pradesh",
    "Meghalaya",
    "Manipur",
    "Mizoram",
    "Nagaland",
    "Tripura",
    "Sikkim",
]

# Water‑borne diseases of interest (simplified list)
WATERBORNE_DISEASES = [
    "cholera",
    "dysentery",
    "typhoid",
    "viral gastroenteritis",
    "hepatitis a",
    "amoebiasis",
]

def main():
    src = RAW_PROCESSED / "idsp_all_outbreaks.csv"
    df = pd.read_csv(src)
    # Normalise case for matching
    df["state"] = df["state"].astype(str).str.strip()
    df["disease"] = df["disease"].astype(str).str.lower().str.strip()

    # Filter to Northeast states
    df_ne = df[df["state"].isin(NE_STATES)]

    # Keep only water‑borne diseases (case‑insensitive match)
    df_water = df_ne[df_ne["disease"].isin([d.lower() for d in WATERBORNE_DISEASES])]

    # Export cleaned CSV
    CLEANED_PATH.parent.mkdir(parents=True, exist_ok=True)
    df_water.to_csv(CLEANED_PATH, index=False)
    print(f"[clean] saved {len(df_water)} rows to {CLEANED_PATH}")

if __name__ == "__main__":
    main()
