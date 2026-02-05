import pandas as pd
from sqlalchemy.orm import Session
from backend.models import Customer, Purchase, Base
from backend.database import engine

def init_db():
    Base.metadata.create_all(bind=engine)

def load_data(db: Session, csv_path: str):
    df = pd.read_csv(csv_path)
    
    # Check if data already exists to avoid duplication
    if db.query(Customer).first():
        print("Data already exists in the database.")
        return

    # Process Customers
    # We need to extract unique customers. 
    # The CSV has one row per purchase, but includes customer details.
    # Assuming Customer ID is unique identifier for customers.
    
    customers_df = df[['Customer ID', 'Age', 'Gender', 'Location', 
                       'Subscription Status', 'Preferred Payment Method', 
                       'Frequency of Purchases']].drop_duplicates(subset=['Customer ID'])
    
    for _, row in customers_df.iterrows():
        customer = Customer(
            id=row['Customer ID'],
            age=row['Age'],
            gender=row['Gender'],
            location=row['Location'],
            subscription_status=row['Subscription Status'],
            preferred_payment_method=row['Preferred Payment Method'],
            frequency_of_purchases=row['Frequency of Purchases']
        )
        db.add(customer)
    
    db.commit()
    
    # Process Purchases
    # We map CSV columns to Purchase model
    for _, row in df.iterrows():
        purchase = Purchase(
            customer_id=row['Customer ID'],
            item_purchased=row['Item Purchased'],
            category=row['Category'],
            purchase_amount=row['Purchase Amount (USD)'],
            size=row['Size'],
            color=row['Color'],
            season=row['Season'],
            review_rating=row['Review Rating'],
            payment_method=row['Payment Method'],
            shipping_type=row['Shipping Type'],
            discount_applied=row['Discount Applied'],
            promo_code_used=row['Promo Code Used'],
            previous_purchases=row['Previous Purchases']
        )
        db.add(purchase)
        
    db.commit()
    print("Data loaded successfully.")
