import pandas as pd
from sqlalchemy.orm import Session
from backend.models import Customer, Purchase, Base
from backend.database import engine

def init_db():
    """Database tables create karta hai."""
    Base.metadata.create_all(bind=engine)

def load_data(db: Session, csv_path: str):
    print(f"📂 Loading data from {csv_path}...")
    df = pd.read_csv(csv_path)
    
    if db.query(Customer).first():
        print("ℹ️ Data already exists in the database. Skipping.")
        return

   
    customers_df = df[[
        'Customer ID', 'Age', 'Gender', 'Location', 
        'Subscription Status', 'Preferred Payment Method', 'Frequency of Purchases'
    ]].drop_duplicates(subset=['Customer ID'])
    
    customer_objs = [
        Customer(
            id=row['Customer ID'],
            age=row['Age'],
            gender=row['Gender'],
            location=row['Location'],
            subscription_status=row['Subscription Status'],
            preferred_payment_method=row['Preferred Payment Method'],
            frequency_of_purchases=row['Frequency of Purchases']
        ) for _, row in customers_df.iterrows()
    ]
    
    db.bulk_save_objects(customer_objs)
    db.commit()
    print(f"👥 {len(customer_objs)} customers loaded.")

    purchase_objs = [
        Purchase(
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
        ) for _, row in df.iterrows()
    ]
    
    db.bulk_save_objects(purchase_objs)
    db.commit()
    print(f"🛍️ {len(purchase_objs)} purchases loaded successfully.")

if __name__ == "__main__":
    from backend.database import SessionLocal
    with SessionLocal() as session:
        load_data(session, "data/shopping_trends.csv")
