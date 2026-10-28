import pandas as pd
import os
import sys

def main():
    # Paths
    outbreak_path = r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\data\processed\idsp_northeast_outbreaks.csv'
    rainfall_path = r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\data\processed\rainfall_monthly.csv'
    output_path = r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\data\processed\training_features.csv'

    # Load outbreak data
    try:
        df = pd.read_csv(outbreak_path)
    except Exception as e:
        print(f'❌ Unable to read outbreak CSV: {e}')
        sys.exit(1)

    # Basic feature engineering
    # Use report_year as numeric
    df['report_year'] = df['report_year'].astype(int)
    # Derive month from first_reported_date if present
    df['first_reported_date'] = pd.to_datetime(df['first_reported_date'], errors='coerce')
    df['month'] = df['first_reported_date'].dt.month
    # If month missing, fill with median month (should be rare)
    if df['month'].isnull().any():
        median_month = int(df['month'].median())
        df['month'].fillna(median_month, inplace=True)
        print(f'⚠️ Filled missing month with median={median_month}')

    # Load rainfall data if it exists
    if os.path.exists(rainfall_path):
        try:
            rain = pd.read_csv(rainfall_path)
            # Expect columns: state, district, year, month, rainfall_mm
            rain['year'] = rain['year'].astype(int)
            rain['month'] = rain['month'].astype(int)
            # Merge on state, district, year, month
            merged = pd.merge(
                df,
                rain,
                left_on=['state', 'district', 'report_year', 'month'],
                right_on=['state', 'district', 'year', 'month'],
                how='left',
                suffixes=('', '_rain')
            )
            if merged['rainfall_mm'].isnull().any():
                print('⚠️ Some records missing rainfall; filling with 0')
                merged['rainfall_mm'].fillna(0, inplace=True)
        except Exception as e:
            print(f'❌ Failed to load/merge rainfall data: {e}')
            merged = df.copy()
            merged['rainfall_mm'] = 0
    else:
        print('⚠️ Rainfall data not found – creating placeholder column with 0')
        merged = df.copy()
        merged['rainfall_mm'] = 0

    # Select features for modelling
    feature_cols = ['report_year', 'month', 'cases', 'deaths', 'rainfall_mm']
    # Encode categorical state/district using simple integer codes
    merged['state_code'] = merged['state'].astype('category').cat.codes
    merged['district_code'] = merged['district'].astype('category').cat.codes
    feature_cols.extend(['state_code', 'district_code'])

    # Target: we create a binary risk label – here we define high risk as cases >= 30
    merged['high_risk'] = (merged['cases'] >= 30).astype(int)

    # Export features
    try:
        merged.to_csv(output_path, index=False)
        print(f'✅ Training features written to {output_path}')
        print(f'Rows: {len(merged)} | Features: {len(feature_cols)}')
    except Exception as e:
        print(f'❌ Unable to write features CSV: {e}')
        sys.exit(1)

if __name__ == '__main__':
    main()
