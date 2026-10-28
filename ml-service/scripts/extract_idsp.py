import os
import pdfplumber
import pandas as pd
from pathlib import Path
import re

RAW_DIR = Path(__file__).parent.parent / "data" / "raw"
PROCESSED_DIR = Path(__file__).parent.parent / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

def clean_table(df: pd.DataFrame) -> pd.DataFrame:
    # Standardise column names
    df.columns = [c.strip().lower().replace(' ', '_') for c in df.columns]
    # Drop empty rows
    df = df.dropna(how='all')
    # Ensure required columns exist
    required = ['year', 'week', 'state', 'district', 'disease', 'cases', 'deaths']
    for col in required:
        if col not in df.columns:
            df[col] = None
    return df[required]

all_frames = []
for pdf_file in RAW_DIR.glob("*.pdf"):
    print(f"[extract] processing {pdf_file.name}")
    try:
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    df = pd.DataFrame(table[1:], columns=table[0])
                    df = clean_table(df)
                    df['source_file'] = pdf_file.name
                    df['page'] = page.page_number
                    all_frames.append(df)
    except Exception as e:
        print(f"[error] {pdf_file.name}: {e}")

if all_frames:
    combined = pd.concat(all_frames, ignore_index=True)
    # Extract year & week from filename if not present
    if combined['year'].isnull().all() or combined['week'].isnull().all():
        def infer_year_week(fname):
            m = re.search(r"(20\d{2})", fname)
            year = int(m.group(1)) if m else None
            wk = re.search(r"week(\d+)", fname, re.IGNORECASE)
            week = int(wk.group(1)) if wk else None
            return year, week
        combined[['year_inf', 'week_inf']] = combined['source_file'].apply(lambda f: pd.Series(infer_year_week(f)))
        combined['year'] = combined['year'].fillna(combined['year_inf']).astype('Int64')
        combined['week'] = combined['week'].fillna(combined['week_inf']).astype('Int64')
        combined = combined.drop(columns=['year_inf', 'week_inf'])

    out_path = PROCESSED_DIR / "idsp_all_outbreaks.csv"
    combined.to_csv(out_path, index=False)
    print(f"[done] extracted data saved to {out_path}")
else:
    print("[warning] No tables extracted.")
