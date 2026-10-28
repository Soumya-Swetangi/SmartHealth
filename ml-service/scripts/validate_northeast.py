import pandas as pd
import sys

def main():
    csv_path = r'C:\Users\pc\OneDrive\Desktop\smart-health-northeast\ml-service\data\processed\idsp_northeast_outbreaks.csv'
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f'Error loading CSV: {e}')
        sys.exit(1)
    print('=== Dataset Summary ===')
    print(f'Rows: {len(df)}')
    print(f'Columns: {list(df.columns)}')
    print('Missing values per column:')
    print(df.isnull().sum())
    dup_ids = df['outbreak_id'].duplicated().sum()
    print(f'Duplicate outbreak_id count: {dup_ids}')
    print('\nSample rows:')
    print(df.head().to_string(index=False))

if __name__ == '__main__':
    main()
