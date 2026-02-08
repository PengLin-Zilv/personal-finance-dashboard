# flash main application

from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Session, Transaction
from parsers import parse_and_load_csv
from sqlalchemy import func
from datetime import datetime

app = Flask(__name__)
CORS(app) # allows cross-origin requests from frontend

# health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Finance Dashboard API is running'})

# get all transactions endpoint
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    """
    search and filter transactions
    supports query parameters: start_date, end_date, category, source

    RESTful API design: search and filter transactions
    """

    session = Session()

    try:
        # base query
        query = session.query(Transaction)

        # date filter
        start_date = request.args.get('start_date')
        if start_date:
            query = query.filter(Transaction.transaction_date >= start_date)

        end_date = request.args.get('end_date')
        if end_date:
            query = query.filter(Transaction.transaction_date <= end_date)

        # category filter
        category = request.args.get('category')
        if category:
            query = query.filter(Transaction.category == category)

        # data source filter
        source = request.args.get('source')
        if source:
            query = query.filter(Transaction.source == source)
        
        # query (newest first)
        query = query.order_by(Transaction.transaction_date.desc())

        # limit results (prevent overload)
        limit = request.args.get('limit', 100, type=int)
        query = query.limit(limit)

        transactions = query.all()

        return jsonify({
            'count': len(transactions),
            'transactions': [t.to_dict() for t in transactions]
        })
    
    finally:
        session.close()

# get summary endpoint
@app.route('/api/summary', methods=['GET'])
def get_summary():
    """
    return summary of spending/ payments
    """
    session = Session()

    try:
        # total spending (negative amounts)
        total_spending = session.query(func.sum(Transaction.amount)) \
            .filter(Transaction.amount < 0 ).scalar() or 0
        
        # total income (positive amounts)
        total_income = session.query(func.sum(Transaction.amount)) \
            .filter(Transaction.amount > 0 ).scalar() or 0
        
        # spending by category
        category_breakdown = session.query(
            Transaction.category,
            func.sum(Transaction.amount).label('total')
        ).group_by(Transaction.category).all()

        # monthly spending 
        monthly_spending = session.query(
            func.strftime('%Y-%m', Transaction.transaction_date).label('month'),
            func.sum(Transaction.amount).label('total')
        ).filter(Transaction.amount < 0) \
         .group_by('month') \
         .order_by('month').all()
    
        return jsonify({
            'total_spending': abs(total_spending),
            'total_income': total_income,
            'net': total_spending + total_income,
            'category_breakdown': [
                {'category': cat, 'amount': abs(total)}
                for cat, total in category_breakdown if total < 0
            ],
            'monthly_spending': [
                {'month': month, 'amount': abs(total)}
                 for month, total in monthly_spending
            ]
        })

    finally:
        session.close()

# upload CSV endpoint
@app.route('/api/upload', methods=['POST'])
def upload_csv():
    """
    upload and process CSV file
    file processing and mistake handling
    """

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    source_type = request.form.get('source_type')

    if not source_type or source_type not in ['apple_card', 'boa_credit']:
        return jsonify({'error': "Invalid or missing source_type"}), 400
    
    # save files
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    file_path = f'data/uploads/{source_type}_{timestamp}.csv'
    file.save(file_path)

    # parse and load csv
    session = Session()
    try:
        count = parse_and_load_csv(file_path, source_type, session)
        return jsonify({
            'success': True,
            'message': f'Imported {count} transactions from {source_type}.'
        })
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
