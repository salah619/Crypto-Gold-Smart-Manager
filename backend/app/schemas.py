from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class TransactionBase(BaseModel):
    asset_type: str
    asset_name: str
    amount: float
    purchase_price: float
    notes: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    notes: Optional[str] = None

class Transaction(TransactionBase):
    id: int
    timestamp: datetime
    owner_id: int
    class Config:
        orm_mode = True
