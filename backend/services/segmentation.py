import pandas as pd
from sqlalchemy.orm import Session
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

from backend.models import Customer, Purchase, CustomerSegment

def perform_segmentation(db: Session):
    print("📊 Starting RFM Segmentation...")
    
    query = db.query(
        Customer.id,
        Customer.frequency_of_purchases,
        Purchase.purchase_amount,
        Purchase.previous_purchases
    ).join(Purchase, Customer.id == Purchase.customer_id)
    
    df = pd.read_sql(query.statement, db.bind)
    
    if df.empty:
        print("⚠️ No data found for segmentation.")
        return

    freq_map = {
        'Weekly': 7, 'Bi-Weekly': 14, 'Fortnightly': 14, 
        'Monthly': 30, 'Quarterly': 90, 'Annually': 365
    }
    df['r_days'] = df['frequency_of_purchases'].map(freq_map).fillna(180)

    r_bins = [0, 8, 15, 31, 91, 1000]
    df['r_score'] = pd.cut(df['r_days'], bins=r_bins, labels=[5, 4, 3, 2, 1]).astype(int)

    for col, new_col in [('previous_purchases', 'f_score'), ('purchase_amount', 'm_score')]:
        try:
            df[new_col] = pd.qcut(df[col], q=5, labels=[1, 2, 3, 4, 5], duplicates='drop').astype(int)
        except ValueError:
            df[new_col] = pd.cut(df[col], bins=5, labels=[1, 2, 3, 4, 5]).astype(int)

    df['rfm_score'] = (df['r_score'] * 100) + (df['f_score'] * 10) + df['m_score']

    features = ['r_days', 'previous_purchases', 'purchase_amount']
    scaled_data = StandardScaler().fit_transform(df[features])
    
    model = KMeans(n_clusters=4, n_init=10, random_state=42)
    df['cluster'] = model.fit_predict(scaled_data)

    order = df.groupby('cluster')['purchase_amount'].mean().sort_values().index
    rank_map = {cluster: label for cluster, label in zip(order, ['Bronze', 'Silver', 'Gold', 'Platinum'])}
    df['segment_label'] = df['cluster'].map(rank_map)

    db.query(CustomerSegment).delete()
    
    segment_objs = [
        CustomerSegment(
            customer_id=row['id'],
            r_score=int(row['r_score']),
            f_score=int(row['f_score']),
            m_score=int(row['m_score']),
            rfm_score=int(row['rfm_score']),
            segment_label=row['segment_label']
        ) for _, row in df.iterrows()
    ]
    
    db.bulk_save_objects(segment_objs)
    db.commit()
    print(f"✅ Segmentation complete. {len(segment_objs)} segments updated.")

if __name__ == "__main__":
    from backend.database import SessionLocal
    with SessionLocal() as session:
        perform_segmentation(session)
