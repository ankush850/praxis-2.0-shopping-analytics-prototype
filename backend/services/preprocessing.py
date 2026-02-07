import pandas as pd
from sqlalchemy.orm import Session
from backend.models import Customer, Purchase, Base
from backend.database import engine

def init_db():
    Base.metadata.create_all(bind=engine)

def load_data(db: Session, csv_path: str):
    print(f"📂 Reading: {csv_path}")
    df = pd.read_csv(csv_path)
    
    if db.query(Customer).first():
        print("ℹ️ Data already exists. Skipping load.")
        return

    cust_df = df[[
        'Customer ID', 'Age', 'Gender', 'Location', 
        'Subscription Status', 'Preferred Payment Method', 'Frequency of Purchases'
    ]].drop_duplicates('Customer ID')

    customer_objs = [
        Customer(
            id=r['Customer ID'], age=r['Age'], gender=r['Gender'], 
            location=r['Location'], subscription_status=r['Subscription Status'],
            preferred_payment_method=r['Preferred Payment Method'], 
            frequency_of_purchases=r['Frequency of Purchases']
        ) for _, r in cust_df.iterrows()
    ]
    
    db.bulk_save_objects(customer_objs)
    print(f"👥 {len(customer_objs)} Customers created.")

    purchase_objs = [
        Purchase(
            customer_id=r['Customer ID'], item_purchased=r['Item Purchased'],
            category=r['Category'], purchase_amount=r['Purchase Amount (USD)'],
            size=r['Size'], color=r['Color'], season=r['Season'],
            review_rating=r['Review Rating'], payment_method=r['Payment Method'],
            shipping_type=r['Shipping Type'], discount_applied=r['Discount Applied'],
            promo_code_used=r['Promo Code Used'], previous_purchases=r['Previous Purchases']
        ) for _, r in df.iterrows()
    ]
    
    db.bulk_save_objects(purchase_objs)
    db.commit() # Final single commit for performance
    print(f"🛍️ {len(purchase_objs)} Purchases created successfully.")

if __name__ == "__main__":
    from backend.database import SessionLocal
    with SessionLocal() as session:
        load_data(session, "data/shopping_trends.csv")
