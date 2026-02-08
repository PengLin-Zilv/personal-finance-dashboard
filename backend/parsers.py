# csv parsers logic

import pandas as pd
from dateutil import parser as date_parser
import json

def parse_apple_card(file_path):
    """
    Parse Apple Card CSV file and return list of transaction dicts
    original format:
    - Transaction Date
    - Description
    - Category: from Apple Card (we don't use this, we will do our own categorization)
    - Amount (USD): positive for charges, neative for payments

    how to parse different data formats from different banks and standardize them into a unified format for our database
    """

    df = pd.read_csv(file_path)

    # standardize column names
    df = df.rename(columns={
        'Transaction Date': 'transaction_date',
        'Description': 'description',
        'Merchant': 'merchant',
        'Amount (USD)': 'amount'
    })

    # only keep relevant columns
    df = df[['transaction_date', 'description', 'merchant', 'amount']]

    # standardize date format
    df['transaction_date'] = pd.to_datetime(df['transaction_date']).dt.date

    # standardize amount: charges = negative, payment = positive
    # Apple Card original data: charges are positive, payments are negative, so reverse this
    df['amount'] = df['amount'] * -1

    # add source origin info
    df['source'] = 'apple_card'

    # save row data for reference (covert to json string)
    original_df = pd.read_csv(file_path) 
    df['raw_data'] = original_df.to_dict('records')
    df['raw_data'] = df['raw_data'].apply(json.dumps)

    return df 

def parse_boa_credit(file_path):
    """
    Parse Bank of America Credit Card CSV

    original format:
    - Posted Date
    - Payee: merchant/ description
    - Amount: negative for charges, positive for payments

    here, differnet bank uses different formats, we need to standardize them to our internal format
    """

    df = pd.read_csv(file_path)

    # standardize column names:
    df = df.rename(columns={
        'Posted Date': 'transaction_date',
        'Payee': 'description',
        'Amount': 'amount'
    })

    # BOA doesn't have separate merchant column, use description as merchant for now
    df['merchant'] = df['description']

    # only keep relevant columns
    df = df[['transaction_date', 'description', 'merchant', 'amount']]

    # standardize date format
    df['transaction_date'] = pd.to_datetime(df['transaction_date']).dt.date

    # BOA original date: charges are already negativem so no change needed

    # add source origin info
    df['source'] = 'boa_credit'

    # save row data for reference (covert to json string)
    original_df = pd.read_csv(file_path)
    df['raw_data'] = original_df.to_dict('records')
    df['raw_data'] = df['raw_data'].apply(json.dumps)

    return df

def parse_and_load_csv(file_path, source_type, session):
    """
    Generic parse and load function to handle any csv file with the appropriate parser function
    
    Args:
        file_path: path to the csv file
        source_type: type of the source (e.g. 'apple_card', 'boa_credit')
        session: SQLAlchemy session 

    Returns:
        number of transactions successfully loaded
    """

    from models import Transaction
    from categorizer import categorize_transaction

    # choose the right parser function based on source type
    if source_type == 'apple_card':
        df = parse_apple_card(file_path)
    elif source_type == 'boa_credit':
        df = parse_boa_credit(file_path)
    else:
        raise ValueError(f'Unknown source type: {source_type}')
    
    # transform dataframe rows into Transaction objects and add to session
    count = 0
    for _, row in df.iterrows():
        # auto categorize transaction
        category = categorize_transaction(row['description'], row['merchant'])
        
        transaction = Transaction(
            transaction_date=row['transaction_date'],
            description=row['description'],
            merchant=row['merchant'],
            amount=row['amount'],
            category=category,
            source=row['source'],
            raw_data=row['raw_data']
        )
        session.add(transaction)
        count += 1
    session.commit()
    return count

# Biggest challenge is that different banks have different csv format.
# Apple card and BOA credit card have different signs and column names
# Used standardization logic to convert them into a unified format for our database
# Also, we want to save the original row data as JSON string in the database for reference, in case we need to debug or reprocess later.
# In the future, we can add more parsers for other banks or financial institutions, and just need to implement the specific parsing logic for each source, while keeping the rest of the processing pipeline consistent.