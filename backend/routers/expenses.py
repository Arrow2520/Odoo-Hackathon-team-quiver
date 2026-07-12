from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.enums import UserRole
from backend.auth import require_roles

router = APIRouter(prefix="/expenses", tags=["Expenses"])


@router.post("", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    payload: schemas.ExpenseCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.DRIVER, UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST))
):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    expense = models.Expense(**payload.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model=List[schemas.ExpenseResponse])
def list_expenses(
    vehicle_id: int = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER))
):
    query = db.query(models.Expense)
    if vehicle_id:
        query = query.filter(models.Expense.vehicle_id == vehicle_id)
    return query.all()