import pandas as pd
from sqlalchemy.orm import Session
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
from backend.models import Purchase, Customer, AffinityResult

def perform_affinity_analysis(db: Session):
    print("Starting affinity analysis...")
    
    # 1. Fetch data
    query = db.query(
        Customer.gender,
        Purchase.category,
        Purchase.item_purchased,
        Purchase.season,
        Customer.age
    ).join(Customer, Purchase.customer_id == Customer.id)
    df = pd.read_sql(query.statement, db.bind)
    
    if df.empty:
        print("No data found for affinity analysis.")
        return

    # 2. Prepare Transactions
    # Binning Age to make it categorical
    df['AgeGroup'] = pd.cut(df['age'], bins=[0, 25, 45, 65, 100], labels=['GenZ', 'Millennial', 'GenX', 'Boomer'])
    
    transactions = []
    for _, row in df.iterrows():
        transaction = [
            f"Gender_{row['gender']}",
            f"Category_{row['category']}",
            f"Item_{row['item_purchased']}",
            f"Season_{row['season']}",
            f"AgeGroup_{row['AgeGroup']}"
        ]
        transactions.append(transaction)
        
    # 3. One-Hot Encoding
    te = TransactionEncoder()
    te_ary = te.fit(transactions).transform(transactions)
    df_transformed = pd.DataFrame(te_ary, columns=te.columns_)
    
    # 4. Apriori
    # Support: minimum support (e.g., 0.05 or 5% occurrence)
    frequent_itemsets = apriori(df_transformed, min_support=0.05, use_colnames=True)
    
    if frequent_itemsets.empty:
        print("No frequent itemsets found. Try lowering min_support.")
        return

    # 5. Association Rules
    rules = association_rules(frequent_itemsets, metric="lift", min_threshold=1.0)
    
    # Filter rules: We are interested in what leads to purchasing a Category or Item
    # Consequents should contain at least one Category or Item tag
    # And Antecedents should generally be Demographics/Context
    
    # Sort by Lift
    top_rules = rules.sort_values(by="lift", ascending=False).head(50)
    
    # 6. Save to DB
    # Clear old results
    db.query(AffinityResult).delete()
    db.commit()
    
    results = []
    for _, row in top_rules.iterrows():
        # Convert frozensets to string
        antecedents = ", ".join(list(row['antecedents']))
        consequents = ", ".join(list(row['consequents']))
        
        result = AffinityResult(
            antecedents=antecedents,
            consequents=consequents,
            support=row['support'],
            confidence=row['confidence'],
            lift=row['lift']
        )
        results.append(result)
        
    db.bulk_save_objects(results)
    db.commit()
    print(f"Affinity analysis completed. Saved {len(results)} rules.")

if __name__ == "__main__":
    from backend.database import SessionLocal
    db = SessionLocal()
    perform_affinity_analysis(db)
    db.close()
