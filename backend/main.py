from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
import pandas as pd

from backend.database import get_db, engine, Base
from backend.models import Customer, Purchase, CustomerSegment, AffinityResult
from backend.services.segmentation import perform_segmentation
from backend.services.affinity import perform_affinity_analysis

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Shopper Behavior Analysis Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models for Response
class SegmentStats(BaseModel):
    segment_label: str
    count: int
    avg_rfm: float

class AffinityRule(BaseModel):
    antecedents: str
    consequents: str
    support: float
    confidence: float
    lift: float

class CustomerProfile(BaseModel):
    id: int
    age: int
    gender: str
    location: str
    segment: Optional[str]
    rfm_score: Optional[int]
    recent_purchase: Optional[str]
    total_spent: Optional[float]

# Endpoints

@app.get("/")
def read_root():
    return {"message": "Welcome to Shopper Behavior Analysis API"}

@app.post("/api/run-analysis")
def run_analysis(db: Session = Depends(get_db)):
    """Triggers segmentation and affinity analysis."""
    try:
        perform_segmentation(db)
        perform_affinity_analysis(db)
        return {"message": "Analysis completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/segments", response_model=List[SegmentStats])
def get_segments(db: Session = Depends(get_db)):
    """Returns segment counts and average RFM score."""
    results = db.query(
        CustomerSegment.segment_label,
        func.count(CustomerSegment.id).label("count"),
        func.avg(CustomerSegment.rfm_score).label("avg_rfm")
    ).group_by(CustomerSegment.segment_label).all()
    
    return [
        SegmentStats(segment_label=r.segment_label, count=r.count, avg_rfm=r.avg_rfm)
        for r in results if r.segment_label is not None
    ]

@app.get("/api/affinity/{category}", response_model=List[AffinityRule])
def get_affinity(category: str, db: Session = Depends(get_db)):
    """Returns top affinities involving a category."""
    # Simple text search in antecedents or consequents
    search_term = f"Category_{category}" # Based on our encoding in affinity.py
    
    # Also search for Item name if user passes item name, but let's assume category for now.
    # Note: Our affinity rules strings look like "Category_Clothing, Gender_Male"
    
    rules = db.query(AffinityResult).filter(
        (AffinityResult.antecedents.contains(category)) | 
        (AffinityResult.consequents.contains(category))
    ).order_by(AffinityResult.lift.desc()).limit(20).all()
    
    return [
        AffinityRule(
            antecedents=r.antecedents,
            consequents=r.consequents,
            support=r.support,
            confidence=r.confidence,
            lift=r.lift
        )
        for r in rules
    ]

@app.get("/api/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_customers = db.query(Customer).count()
    avg_purchase = db.query(func.avg(Purchase.purchase_amount)).scalar()
    avg_rating = db.query(func.avg(Purchase.review_rating)).scalar()
    
    return {
        "total_customers": total_customers,
        "avg_purchase_amount": round(avg_purchase, 2) if avg_purchase else 0,
        "avg_rating": round(avg_rating, 2) if avg_rating else 0
    }

# --- New Endpoints for Advanced Visualizations ---

@app.get("/api/demographics")
def get_demographics(db: Session = Depends(get_db)):
    # Gender Distribution
    gender_counts = db.query(Customer.gender, func.count(Customer.id)).group_by(Customer.gender).all()
    gender_data = [{"name": g, "value": c} for g, c in gender_counts]
    
    # Age Groups
    # SQLite doesn't have width_bucket easily, so we fetch all ages and bin in Python for simplicity
    # or use CASE WHEN in SQL. Let's use Python for flexibility with small dataset.
    ages = db.query(Customer.age).all()
    age_values = [a[0] for a in ages]
    
    bins = [18, 25, 35, 45, 55, 65, 100]
    labels = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    age_series = pd.Series(age_values)
    age_groups = pd.cut(age_series, bins=bins, labels=labels, right=False).value_counts().sort_index()
    age_data = [{"name": idx, "value": val} for idx, val in age_groups.items()]
    
    return {"gender": gender_data, "age_groups": age_data}

@app.get("/api/locations")
def get_top_locations(db: Session = Depends(get_db)):
    locs = db.query(Customer.location, func.count(Customer.id).label('count')).group_by(Customer.location).order_by(func.count(Customer.id).desc()).limit(10).all()
    return [{"name": l, "value": c} for l, c in locs]

@app.get("/api/categories")
def get_category_share(db: Session = Depends(get_db)):
    cats = db.query(Purchase.category, func.count(Purchase.id)).group_by(Purchase.category).all()
    return [{"name": c, "value": v} for c, v in cats]

@app.get("/api/season-category")
def get_season_category_heatmap(db: Session = Depends(get_db)):
    # Matrix of Season x Category
    results = db.query(Purchase.season, Purchase.category, func.count(Purchase.id)).group_by(Purchase.season, Purchase.category).all()
    
    # Transform into format suitable for heatmap (or simple list)
    # Recharts doesn't have a native heatmap, so we'll send a list of {x: season, y: category, value: count}
    data = []
    for s, c, v in results:
        data.append({"season": s, "category": c, "value": v})
    return data

@app.get("/api/purchase-dist")
def get_purchase_distribution(db: Session = Depends(get_db)):
    try:
        # Histogram data for purchase amount
        amounts = db.query(Purchase.purchase_amount).all()
        vals = [a[0] for a in amounts if a[0] is not None]
        
        # Binning 0-100 in steps of 10
        bins = list(range(0, 110, 10))
        dist = pd.cut(vals, bins=bins).value_counts().sort_index()
        
        data = [{"range": f"${i.left}-{i.right}", "count": c} for i, c in dist.items()]
        return data
    except Exception as e:
        print(f"ERROR in get_purchase_distribution: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customer/{id}", response_model=CustomerProfile)
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    segment = db.query(CustomerSegment).filter(CustomerSegment.customer_id == id).first()
    purchase = db.query(Purchase).filter(Purchase.customer_id == id).first() # Assuming single purchase for now
    
    return CustomerProfile(
        id=customer.id,
        age=customer.age,
        gender=customer.gender,
        location=customer.location,
        segment=segment.segment_label if segment else None,
        rfm_score=segment.rfm_score if segment else None,
        recent_purchase=purchase.item_purchased if purchase else None,
        total_spent=purchase.purchase_amount if purchase else 0.0
    )
