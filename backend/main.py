from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import os

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 数据模型
class Transaction(BaseModel):
    type: str
    account: str
    points: float
    unit_price: float
    total_amount: float
    username: str
    status: str
    created_at: Optional[datetime] = None

# 初始化数据库
def init_db():
    if not os.path.exists('transactions.db'):
        conn = sqlite3.connect('transactions.db')
        c = conn.cursor()
        c.execute('''
            CREATE TABLE transactions
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
             type TEXT,
             account TEXT,
             points REAL,
             unit_price REAL,
             total_amount REAL,
             username TEXT,
             status TEXT,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
        ''')
        conn.commit()
        conn.close()

# API路由
@app.get("/transactions")
async def get_transactions():
    conn = sqlite3.connect('transactions.db')
    c = conn.cursor()
    c.execute('SELECT * FROM transactions ORDER BY created_at DESC')
    rows = c.fetchall()
    conn.close()
    
    transactions = []
    for row in rows:
        transactions.append({
            "id": row[0],
            "type": row[1],
            "account": row[2],
            "points": row[3],
            "unit_price": row[4],
            "total_amount": row[5],
            "username": row[6],
            "status": row[7],
            "created_at": row[8]
        })
    return transactions

@app.post("/transactions")
async def create_transaction(transaction: Transaction):
    conn = sqlite3.connect('transactions.db')
    c = conn.cursor()
    c.execute('''
        INSERT INTO transactions 
        (type, account, points, unit_price, total_amount, username, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        transaction.type,
        transaction.account,
        transaction.points,
        transaction.unit_price,
        transaction.total_amount,
        transaction.username,
        transaction.status
    ))
    conn.commit()
    conn.close()
    return {"message": "Transaction created successfully"}

if __name__ == "__main__":
    init_db()
    uvicorn.run(app, host="0.0.0.0", port=8000)