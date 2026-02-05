import pandas as pd
from sqlalchemy.orm import Session
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from backend.models import Customer, Purchase, CustomerSegment

def perform_segmentation(db: Session):
    print("Starting customer segmentation...")
    
    # 1. Fetch data
    # Join Customer and Purchase to get necessary fields
    query = db.query(
        Customer.id,
        Customer.frequency_of_purchases,
        Purchase.purchase_amount,
        Purchase.previous_purchases
    ).join(Purchase, Customer.id == Purchase.customer_id)
    
    df = pd.read_sql(query.statement, db.bind)
    
    print(f"Data for segmentation: {len(df)} rows")
    if df.empty:
        print("No data found for segmentation.")
        return

    # 2. Preprocess RFM
    # Recency Proxy: Map 'Frequency of Purchases' to approximate days
    frequency_map = {
        'Weekly': 7,
        'Bi-Weekly': 14,
        'Fortnightly': 14,
        'Monthly': 30,
        'Quarterly': 90,
        'Every 3 Months': 90,
        'Annually': 365
    }
    
    # Fill missing or unknown values with a default (e.g., 180)
    df['recency_days'] = df['frequency_of_purchases'].map(frequency_map).fillna(180)
    
    # Frequency: Use 'previous_purchases'
    df['frequency_val'] = df['previous_purchases']
    
    # Monetary: Use 'purchase_amount'
    df['monetary_val'] = df['purchase_amount']
    
    # 3. Calculate RFM Scores (Quantiles)
    # We want 1-5 scores.
    # Recency: Lower days is better (5), Higher days is worse (1)
    # Using manual mapping because discrete values might cause qcut issues
    r_score_map = {7: 5, 14: 4, 30: 3, 90: 2, 365: 1}
    df['r_score'] = df['recency_days'].map(r_score_map).fillna(3).astype(int)
    
    # Frequency: Higher is better
    # Use qcut with labels=False to get 0-4 indices, then add 1
    try:
        df['f_score'] = pd.qcut(df['frequency_val'], q=5, labels=False, duplicates='drop') + 1
    except ValueError:
        df['f_score'] = pd.cut(df['frequency_val'], bins=5, labels=False) + 1
    df['f_score'] = df['f_score'].astype(int)

    # Monetary: Higher is better
    try:
        df['m_score'] = pd.qcut(df['monetary_val'], q=5, labels=False, duplicates='drop') + 1
    except ValueError:
        df['m_score'] = pd.cut(df['monetary_val'], bins=5, labels=False) + 1
    df['m_score'] = df['m_score'].astype(int)

    
    df['rfm_score'] = df['r_score'].astype(str) + df['f_score'].astype(str) + df['m_score'].astype(str)
    df['rfm_score'] = df['rfm_score'].astype(int)
    
    # 4. K-Means Clustering
    features = df[['recency_days', 'frequency_val', 'monetary_val']]
    scaler = StandardScaler()
    scaled_features = scaler.fit_transform(features)
    
    # Determine optimal k (simplified: use 4 as requested)
    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(scaled_features)
    
    # Map clusters to meaningful labels (optional, based on centroids)
    # For now, just save Cluster 0, 1, 2, 3
    cluster_labels = {0: 'Bronze', 1: 'Silver', 2: 'Gold', 3: 'Platinum'}
    # Note: K-Means labels are arbitrary, so mapping might not be ordered.
    # To order them, we can look at mean RFM values per cluster.
    
    cluster_summary = df.groupby('cluster')[['monetary_val', 'frequency_val']].mean().sum(axis=1).sort_values()
    # Map rank 0 (lowest) -> Bronze, etc.
    rank_map = {cluster: label for cluster, label in zip(cluster_summary.index, ['Bronze', 'Silver', 'Gold', 'Platinum'])}
    df['segment_label'] = df['cluster'].map(rank_map)

    # 5. Save to Database
    # Clear existing segments
    db.query(CustomerSegment).delete()
    db.commit()
    
    segments = []
    for _, row in df.iterrows():
        segment = CustomerSegment(
            customer_id=row['id'],
            r_score=row['r_score'],
            f_score=row['f_score'],
            m_score=row['m_score'],
            rfm_score=row['rfm_score'],
            segment_label=row['segment_label']
        )
        segments.append(segment)
    
    db.bulk_save_objects(segments)
    db.commit()
    print("Segmentation completed and saved.")

if __name__ == "__main__":
    from backend.database import SessionLocal
    db = SessionLocal()
    perform_segmentation(db)
    db.close()
