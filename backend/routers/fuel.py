from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas

router = APIRouter(prefix="/fuel-logs", tags=["Fuel"])


@router.post("", response_model=schemas.FuelLogResponse, status_code=status.HTTP_201_CREATED)
def create_fuel_log(payload: schemas.FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    log = models.FuelLog(**payload.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=List[schemas.FuelLogResponse])
def list_fuel_logs(vehicle_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.FuelLog)
    if vehicle_id:
        query = query.filter(models.FuelLog.vehicle_id == vehicle_id)
    return query.all()
