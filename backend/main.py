import pandas as pd
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.database import get_db, engine, Base
from backend.models import Customer, Purchase, CustomerSegment, AffinityResult
from backend.services.segmentation import perform_segmentation
from backend.services.affinity import perform_affinity_analysis

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Shopper Behavior Analysis Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


def get_binned_data(values, bins, labels):
    """Helper to bin numerical data using pandas."""
    series = pd.Series(values)
    counts = pd.cut(series, bins=bins, labels=labels, right=False).value_counts().sort_index()
    return [{"name": str(idx), "value": int(val)} for idx, val in counts.items()]

@app.get("/")
def read_root():
    return {"status": "online", "message": "Shopper Behavior Analysis API"}

@app.post("/api/run-analysis")
def run_analysis(db: Session = Depends(get_db)):
    try:
        perform_segmentation(db)
        perform_affinity_analysis(db)
        return {"message": "Analysis completed successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    summary = db.query(
        func.count(Customer.id).label("total_customers"),
        func.avg(Purchase.purchase_amount).label("avg_purchase"),
        func.avg(Purchase.review_rating).label("avg_rating")
    ).first()
    
    return {
        "total_customers": summary.total_customers or 0,
        "avg_purchase_amount": round(summary.avg_purchase or 0, 2),
        "avg_rating": round(summary.avg_rating or 0, 2)
    }


@app.get("/api/segments", response_model=List[SegmentStats])
def get_segments(db: Session = Depends(get_db)):
    results = db.query(
        CustomerSegment.segment_label,
        func.count(CustomerSegment.id).label("count"),
        func.avg(CustomerSegment.rfm_score).label("avg_rfm")
    ).group_by(CustomerSegment.segment_label).all()
    
    return [SegmentStats(segment_label=r.segment_label, count=r.count, avg_rfm=r.avg_rfm) 
            for r in results if r.segment_label]

@app.get("/api/affinity/{category}", response_model=List[AffinityRule])
def get_affinity(category: str, db: Session = Depends(get_db)):
    rules = db.query(AffinityResult).filter(
        (AffinityResult.antecedents.contains(category)) | 
        (AffinityResult.consequents.contains(category))
    ).order_by(AffinityResult.lift.desc()).limit(20).all()
    
    return rules


@app.get("/api/demographics")
def get_demographics(db: Session = Depends(get_db)):
    # Gender Data
    genders = db.query(Customer.gender, func.count(Customer.id)).group_by(Customer.gender).all()
    
    # Age Data (Binned)
    ages = [a[0] for a in db.query(Customer.age).all()]
    age_bins = [18, 25, 35, 45, 55, 65, 100]
    age_labels = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    
    return {
        "gender": [{"name": g, "value": c} for g, c in genders],
        "age_groups": get_binned_data(ages, age_bins, age_labels)
    }

@app.get("/api/locations")
def get_top_locations(db: Session = Depends(get_db)):
    locs = db.query(Customer.location, func.count(Customer.id)).group_by(Customer.location)\
             .order_by(func.count(Customer.id).desc()).limit(10).all()
    return [{"name": l, "value": c} for l, c in locs]

@app.get("/api/categories")
def get_category_share(db: Session = Depends(get_db)):
    cats = db.query(Purchase.category, func.count(Purchase.id)).group_by(Purchase.category).all()
    return [{"name": c, "value": v} for c, v in cats]


@app.get("/api/season-category")
def get_season_category_heatmap(db: Session = Depends(get_db)):
    results = db.query(Purchase.season, Purchase.category, func.count(Purchase.id))\
                .group_by(Purchase.season, Purchase.category).all()
    return [{"season": s, "category": c, "value": v} for s, c, v in results]

@app.get("/api/purchase-dist")
def get_purchase_distribution(db: Session = Depends(get_db)):
    amounts = [a[0] for a in db.query(Purchase.purchase_amount).all() if a[0] is not None]
    
    # Bins for $0-$10, $10-$20, etc.
    bins = list(range(0, 110, 10))
    series = pd.Series(amounts)
    dist = pd.cut(series, bins=bins).value_counts().sort_index()
    
    return [{"range": f"${int(i.left)}-{int(i.right)}", "count": int(c)} for i, c in dist.items()]


@app.get("/api/customer/{id}", response_model=CustomerProfile)
def get_customer(id: int, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.id == id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    segment = db.query(CustomerSegment).filter(CustomerSegment.customer_id == id).first()
    purchase = db.query(Purchase).filter(Purchase.customer_id == id).first()
    
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
