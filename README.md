# 🛍️ Shopper Behavior Analysis Platform

![Python](https://img.shields.io/badge/Python-3.8%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95%2B-009688)
![React](https://img.shields.io/badge/React-18.0%2B-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

A comprehensive, full-stack analytics platform designed to uncover hidden trends in customer shopping behavior. By combining **machine learning** (Clustering, Association Rules) with a modern **interactive dashboard**, this tool transforms raw transactional data into actionable business intelligence.

---

## 🚀 Key Features

### 📊 Interactive Dashboard
Get a bird's-eye view of your business health with real-time visualizations.
- **Sales Metrics**: Track Total Customers, Average Purchase Value, and Review Ratings.
- **Demographics**: Interactive charts for Gender and Age Group distribution.
- **Geospatial**: Top 10 Locations analysis.
- **Category Insights**: Market share breakdowns by product category.

### 🧩 Intelligent Segmentation
Move beyond basic demographics with behavioral clustering.
- **RFM Analysis**: Scores customers based on **Recency** (how recently they bought), **Frequency** (how often), and **Monetary** value (how much they spent).
- **K-Means Clustering**: Automatically groups customers into distinct personas:
    - 🏆 **Platinum**: High spenders, frequent shoppers.
    - 🥇 **Gold**: Loyal, consistent customers.
    - 🥈 **Silver**: Occasional shoppers with potential.
    - 🥉 **Bronze**: New or dormant users.

### 🔗 Affinity Analysis (Market Basket)
Discover what products or traits go together using the **Apriori Algorithm**.
- **Cross-Category Recommendations**: "If a customer buys *Footwear*, they are 30% likely to buy *Outerwear*."
- **Demographic patterns**: "Male customers in Winter prefer *Dark Colors*."

---

## 🛠️ Tech Stack

| Component | Technology | Role |
|-----------|------------|------|
| **Backend** | **FastAPI** | High-performance async REST API |
| **Database** | **SQLite** | Lightweight, file-based relational storage |
| **ORM** | **SQLAlchemy** | Type-safe database interactions |
| **ML Engine** | **Scikit-learn** | K-Means Clustering implementation |
| **Analytics** | **Pandas & Mlxtend** | Data manipulation and Association Rule Mining |
| **Frontend** | **React (Vite)** | Blazing fast SPA framework |
| **Charts** | **Recharts** | Responsive, composable React charts |

---
## Architecture Diagram

```mermaid
graph TD
    subgraph "Frontend Layer"
        FE[Frontend React<br/>- Dashboards & Visual UI<br/>- Fetches from Backend]
    end
    
    subgraph "Backend Layer"
        BE[Backend API Server<br/>- Analytics endpoints<br/>- Business logic]
    end
    
    subgraph "Data Layer"
        DB[SQLite Database<br/>- customers<br/>- transactions<br/>- products]
    end
    
    FE -- REST API --> BE
    BE -- "Python ORM<br/>(SQLAlchemy)" --> DB
    BE -- "Database Queries" --> DB
 ```
## 📂 Project Structure

```bash
unstop/
├── backend/
│   ├── services/           # 🧠 ML & Data Logic
│   │   ├── segmentation.py # RFM & K-Means Logic
│   │   ├── affinity.py     # Apriori / Association Rules
│   │   └── preprocessing.py# Data cleaning pipelines
│   ├── database.py         # 🔌 DB Connection
│   ├── models.py           # 🗄️ SQL Models (Customer, Purchase, etc.)
│   ├── main.py             # 🚦 API Routes
│   └── init_db.py          # ⚙️ Seeding script
├── frontend/
│   ├── src/
│   │   ├── components/     # 🎨 UI Widgets (Dashboard, Charts)
│   │   └── App.jsx         # 🧭 Navigation & Layout
└── README.md
```

---

## ⚡ Quick Start Guide

### 1. Backend Setup (Python)

Navigate to the backend folder and set up the environment.

```bash
cd backend

# Create virtual environment (Optional)
python -m venv venv
# Activate: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)

# Install dependencies
pip install -r requirements.txt

# Initialize Database & Load Data
python init_db.py

# Start the API Server
uvicorn main:app --reload
```
*Server runs at `http://localhost:8000`*

### 2. Frontend Setup (React)

Open a new terminal and set up the dashboard.

```bash
cd frontend

# Install Node modules
npm install

# Start Development Server
npm run dev
```
*Dashboard runs at `http://localhost:5173`*

---

## 🔍 Data Science Methodology

### Customer Segmentation (K-Means)
We use a **4-cluster approach** based on normalized RFM scores:
1.  **Data Normalization**: `StandardScaler` is applied to Purchase Amount and Frequency to ensure equal weighting.
2.  **Elbow Method**: Used to determine optimal `k=4`.
3.  **Labeling**: Clusters are qualitatively labeled (Platinum -> Bronze) based on mean centroid values.

### Affinity Analysis
We use **Association Rule Mining** to find relationships:
- **Support**: How frequently the itemset appears in the dataset.
- **Confidence**: Likelihood of item Y being purchased when item X is purchased.
- **Lift**: The strength of the association (Lift > 1 implies a positive correlation).

---

## 🔮 Future Roadmap
- [ ] **NLP Sentiment Analysis**: Integrate TextBlob to analyze textual reviews.
- [ ] **Predictive CLTV**: Forecast Customer Lifetime Value using regression models.
- [ ] **Real-time Ingestion**: Connect to live transaction streams (Kafka/RabbitMQ).
- [ ] **Dockerization**: Full container support for one-click deployment.

---
