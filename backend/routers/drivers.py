from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.enums import DriverStatus, UserRole
from backend.auth import require_roles

router = APIRouter(prefix="/drivers", tags=["Drivers"])


@router.post("", response_model=schemas.DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: schemas.DriverCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER, UserRole.FLEET_MANAGER))
):
    existing = db.query(models.Driver).filter(
        models.Driver.license_number == payload.license_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="License number already exists")

    driver = models.Driver(**payload.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.get("", response_model=List[schemas.DriverResponse])
def list_drivers(
    status_filter: Optional[DriverStatus] = None, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST))
):
    query = db.query(models.Driver)
    if status_filter:
        query = query.filter(models.Driver.status == status_filter)
    return query.all()


@router.get("/dispatch-pool", response_model=List[schemas.DriverResponse])
def get_dispatchable_drivers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER, UserRole.DRIVER))
):
    today = date.today()
    return db.query(models.Driver).filter(
        models.Driver.status == DriverStatus.AVAILABLE,
        models.Driver.license_expiry >= today, 
    ).all()


@router.get("/{driver_id}", response_model=schemas.DriverResponse)
def get_driver(
    driver_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST))
):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.patch("/{driver_id}", response_model=schemas.DriverResponse)
def update_driver(
    driver_id: int, 
    payload: schemas.DriverUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER, UserRole.FLEET_MANAGER))
):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)

    db.commit()
    db.refresh(driver)
    return driver


@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_driver(
    driver_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER, UserRole.FLEET_MANAGER))
):
    driver = db.query(models.Driver).filter(models.Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(driver)
    db.commit()
    return None