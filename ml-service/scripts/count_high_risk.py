import pandas as pd
import sys

def main():
    path = r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\data\processed\training_features.csv'
    try:
        df = pd.read_csv(path)
    except Exception as e:
        print(f'❌ Failed to load features CSV: {e}')
        sys.exit(1)
    pos = df['high_risk'].sum()
    neg = (df['high_risk'] == 0).sum()
    print(f'Positive (high risk) rows: {pos}')
    print(f'Negative rows: {neg}')
    print(f'Total rows: {len(df)}')

if __name__ == '__main__':
    main()
