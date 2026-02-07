from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    gender = Column(String)
    location = Column(String)
    subscription_status = Column(String)
    preferred_payment_method = Column(String)
    frequency_of_purchases = Column(String)

    purchases = relationship("Purchase", back_populates="customer")
    segment = relationship("CustomerSegment", back_populates="customer", uselist=False)


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    
    item_purchased = Column(String)
    category = Column(String)
    purchase_amount = Column(Float)
    size = Column(String)
    color = Column(String)
    season = Column(String)
  
    review_rating = Column(Float)
    payment_method = Column(String)
    shipping_type = Column(String)
    discount_applied = Column(String)
    promo_code_used = Column(String)
    previous_purchases = Column(Integer)

    customer = relationship("Customer", back_populates="purchases")


class CustomerSegment(Base):
    __tablename__ = "customer_segments"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), unique=True)
    
    r_score = Column(Integer)
    f_score = Column(Integer)
    m_score = Column(Integer)
    rfm_score = Column(Integer)
    segment_label = Column(String)

    customer = relationship("Customer", back_populates="segment")


class AffinityResult(Base):
    """Stores Market Basket Analysis (Association Rules) results."""
    __tablename__ = "affinity_results"

    id = Column(Integer, primary_key=True, index=True)
    antecedents = Column(String)  # Example: "Category_Clothing"
    consequents = Column(String)  # Example: "Category_Footwear"
    
    support = Column(Float)
    confidence = Column(Float)
    lift = Column(Float)
