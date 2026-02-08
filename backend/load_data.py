# backend/load_data.py
"""
Initial data loader - imports CSV files into the database
Run this once to populate your database with historical transactions
"""

from models import Session
from parsers import parse_and_load_csv

def main():
    session = Session()
    
    print("🚀 Starting data import...")
    print("=" * 50)
    
    # Load Apple Card data
    print("\n📱 Loading Apple Card transactions...")
    try:
        count1 = parse_and_load_csv('data/apple_card.csv', 'apple_card', session)
        print(f"✅ Successfully imported {count1} transactions from Apple Card")
    except Exception as e:
        print(f"❌ Error loading Apple Card data: {e}")
        count1 = 0
    
    # Load BOA Credit data
    print("\n🏦 Loading BOA Credit transactions...")
    try:
        count2 = parse_and_load_csv('data/boa_credit.csv', 'boa_credit', session)
        print(f"✅ Successfully imported {count2} transactions from BOA Credit")
    except Exception as e:
        print(f"❌ Error loading BOA data: {e}")
        count2 = 0
    
    print("\n" + "=" * 50)
    print(f"🎉 Total: {count1 + count2} transactions loaded!")
    print(f"📊 Database location: data/finance.db")
    
    session.close()

if __name__ == '__main__':
    main()