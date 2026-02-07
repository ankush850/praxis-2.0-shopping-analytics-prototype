import pandas as pd
from sqlalchemy.orm import Session
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder

from backend.models import Purchase, Customer, AffinityResult

def perform_affinity_analysis(db: Session):
    print("🚀 Starting affinity analysis...")
    
    query = db.query(
        Customer.gender,
        Customer.age,
        Purchase.category,
        Purchase.item_purchased,
        Purchase.season
    ).join(Customer, Purchase.customer_id == Customer.id)
    
    df = pd.read_sql(query.statement, db.bind)
    
    if df.empty:
        print("⚠️ No data found for analysis.")
        return

    
    age_bins = [0, 25, 45, 65, 100]
    age_labels = ['GenZ', 'Millennial', 'GenX', 'Boomer']
    df['AgeGroup'] = pd.cut(df['age'], bins=age_bins, labels=age_labels)

   
    transactions = df.apply(lambda x: [
        f"Gender_{x['gender']}",
        f"Category_{x['category']}",
        f"Item_{x['item_purchased']}",
        f"Season_{x['season']}",
        f"AgeGroup_{x['AgeGroup']}"
    ], axis=1).tolist()

    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df_transformed = pd.DataFrame(te_ary, columns=te.columns_)

    frequent_itemsets = apriori(df_transformed, min_support=0.05, use_colnames=True)
    
    if frequent_itemsets.empty:
        print("❌ No frequent patterns found. Lower min_support.")
        return

    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
    top_rules = rules.sort_values(by="lift", ascending=False).head(50)

    db.query(AffinityResult).delete()
    
    affinity_objects = [
        AffinityResult(
            antecedents=", ".join(list(row['antecedents'])),
            consequents=", ".join(list(row['consequents'])),
            support=row['support'],
            confidence=row['confidence'],
            lift=row['lift']
        )
        for _, row in top_rules.iterrows()
    ]
    
    db.bulk_save_objects(affinity_objects)
    db.commit()
    
    print(f"✅ Analysis completed. {len(affinity_objects)} rules saved.")

if __name__ == "__main__":
    from backend.database import SessionLocal
    with SessionLocal() as db_session:
        perform_affinity_analysis(db_session)
