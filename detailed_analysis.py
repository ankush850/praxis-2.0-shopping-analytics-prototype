import pandas as pd

# Load data
df = pd.read_csv('shopping_trends.csv')

def print_section(title):
    print(f"\n=== {title} ===")

# 1. Sample Specific Observations
print_section("SAMPLE VERIFICATION")
sample_1 = df[df['Customer ID'] == 1].iloc[0]
sample_2 = df[df['Customer ID'] == 2].iloc[0]
print(f"ID 1: {sample_1['Age']}y/o {sample_1['Gender']}, {sample_1['Location']}. Bought {sample_1['Item Purchased']} (${sample_1['Purchase Amount (USD)']}).")
print(f"ID 2: {sample_2['Age']}y/o {sample_2['Gender']}, {sample_2['Location']}. Bought {sample_2['Item Purchased']} (${sample_2['Purchase Amount (USD)']}).")

# 2. Demographics
print_section("DEMOGRAPHICS")
print(f"Total Customers: {len(df)}")
print(f"Gender Distribution:\n{df['Gender'].value_counts(normalize=True) * 100}")
print(f"Age Stats: Mean={df['Age'].mean():.1f}, Median={df['Age'].median()}")
# Age Groups
bins = [18, 25, 35, 45, 55, 65, 100]
labels = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
df['AgeGroup'] = pd.cut(df['Age'], bins=bins, labels=labels, right=False)
print(f"Age Groups:\n{df['AgeGroup'].value_counts(normalize=True) * 100}")
print(f"Top 5 Locations:\n{df['Location'].value_counts().head(5)}")

# 3. Product & Purchase
print_section("PRODUCT & PURCHASE")
print(f"Avg Purchase Amount: ${df['Purchase Amount (USD)'].mean():.2f}")
print(f"Top 5 Categories:\n{df['Category'].value_counts(normalize=True) * 100}")
print(f"Top 5 Items:\n{df['Item Purchased'].value_counts().head(5)}")
print(f"Seasonality:\n{df['Season'].value_counts(normalize=True) * 100}")

# 4. Payment & Shipping
print_section("PAYMENT & SHIPPING")
print(f"Payment Methods:\n{df['Payment Method'].value_counts(normalize=True) * 100}")
print(f"Shipping Types:\n{df['Shipping Type'].value_counts(normalize=True) * 100}")

# 5. Loyalty
print_section("LOYALTY")
print(f"Subscription Rate:\n{df['Subscription Status'].value_counts(normalize=True) * 100}")
print(f"Purchase Frequency:\n{df['Frequency of Purchases'].value_counts(normalize=True) * 100}")
print(f"Avg Previous Purchases: {df['Previous Purchases'].mean():.1f}")

# 6. Ratings & Preferences
print_section("RATINGS & PREFERENCES")
print(f"Avg Review Rating: {df['Review Rating'].mean():.2f}")
print(f"Most Popular Size:\n{df['Size'].value_counts(normalize=True).head(3) * 100}")
print(f"Most Popular Color:\n{df['Color'].value_counts(normalize=True).head(5) * 100}")

# 7. Cross Analysis (Simple)
print_section("CROSS ANALYSIS")
# Spend by Gender
print("Avg Spend by Gender:")
print(df.groupby('Gender')['Purchase Amount (USD)'].mean())
# Spend by Category
print("\nAvg Spend by Category:")
print(df.groupby('Category')['Purchase Amount (USD)'].mean())
