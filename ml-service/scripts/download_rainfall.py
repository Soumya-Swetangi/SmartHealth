import os
import requests
import xarray as xr
import pandas as pd
from pathlib import Path
import datetime

# CHIRPS global monthly netCDF base URL (public)
BASE_URL = "https://data.chc.ucsb.edu/products/CHIRPS-2.0/global_monthly/netcdf/chirps-v2.0.{year}.{month:02d}.nc"

OUT_DIR = Path(__file__).parent.parent / "data" / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)

# Bounding box for Northeast India (approx.)
MIN_LAT, MAX_LAT = 21.0, 29.5
MIN_LON, MAX_LON = 88.0, 97.5

def download_month(year: int, month: int) -> Path:
    url = BASE_URL.format(year=year, month=month)
    local_path = OUT_DIR / f"chirps_{year}_{month:02d}.nc"
    if local_path.exists():
        print(f"[skip] {local_path.name} already downloaded")
        return local_path
    print(f"[download] {url}")
    resp = requests.get(url, stream=True, timeout=30)
    resp.raise_for_status()
    with open(local_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    return local_path

def aggregate_monthly(ds: xr.Dataset) -> pd.DataFrame:
    # Subset to region
    region = ds.sel(lat=slice(MIN_LAT, MAX_LAT), lon=slice(MIN_LON, MAX_LON))
    # Compute total rainfall per grid cell for the month (already monthly)
    df = region['precip'].to_dataframe().reset_index()
    df = df.rename(columns={'precip': 'rainfall_mm'})
    return df

def main():
    parser = __import__('argparse').ArgumentParser(description='Download CHIRPS rainfall data for given year range')
    parser.add_argument('--years', nargs='+', type=int, required=True, help='Years to download, e.g. 2023 2024')
    args = parser.parse_args()

    all_dfs = []
    for year in args.years:
        for month in range(1, 13):
            try:
                nc_path = download_month(year, month)
                ds = xr.open_dataset(nc_path)
                df_month = aggregate_monthly(ds)
                df_month['year'] = year
                df_month['month'] = month
                all_dfs.append(df_month)
            except Exception as e:
                print(f"[error] {year}-{month:02d}: {e}")
    if all_dfs:
        combined = pd.concat(all_dfs, ignore_index=True)
        out_csv = OUT_DIR / "rainfall_monthly.csv"
        combined.to_csv(out_csv, index=False)
        print(f"[done] rainfall data saved to {out_csv}")
    else:
        print("[warning] No rainfall data downloaded")

if __name__ == "__main__":
    main()
