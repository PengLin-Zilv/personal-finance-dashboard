# database models

# database design

from sqlalchemy import create_engine, Column, Integer, String, Float, Date, JSON, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Transaction(Base):
    """
    Unified transaction model that handles data from multiple financial sources

    Key design decisions:
    - Negative amounts = spending, positive = income (standardized across sources)
    - raw_data stored as JSON for debugging and future reprocessing
    - indexed on transaction_date and category for fast queries
    """
    __tablename__ = 'transactions'

    id = Column(Integer, primary_key=True)

    # core 
    transaction_date = Column(Date, nullable=False, index=True)  # date of the transaction
    description = Column(String, nullable=False) # description of the transaction
    merchant= Column(String, nullable=False) # merchant involved in the transaction
    amount = Column(Float, nullable=False) # amount of the transaction
    category = Column(String, index=True) # auto categorized category

    # metadata
    source = Column(String, nullable=False) # 'apple_card' or 'boa_credit' etc
    raw_data = Column(JSON) # raw data from the csv row
    created_at = Column(DateTime, default=datetime.utcnow) # record creation timestamp

    def to_dict(self):
        return {
            'id': self.id,
            'transaction_date': self.transaction_date.isoformat(),
            'description': self.description,
            'merchant': self.merchant,
            'amount': self.amount,
            'category': self.category,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            
        }
    
    def __repr__(self):
        return f"<Transaction(id={self.id}, date={self.transaction_date}, amount={self.amount}, category={self.category})>"
    # Datebase connection setup
engine = create_engine('sqlite:///data/finance.db', echo=True)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)