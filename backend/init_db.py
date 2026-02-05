from backend.database import SessionLocal
from backend.services.preprocessing import init_db, load_data
import os

def main():
    print("Initializing database...")
    init_db()
    
    db = SessionLocal()
    try:
        csv_path = os.path.join(os.getcwd(), "shopping_trends.csv")
        if os.path.exists(csv_path):
            print(f"Loading data from {csv_path}...")
            load_data(db, csv_path)
        else:
            print(f"File not found: {csv_path}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
