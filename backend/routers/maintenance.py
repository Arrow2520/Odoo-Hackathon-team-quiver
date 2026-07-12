from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.enums import VehicleStatus, MaintenanceStatus

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])


@router.post("", response_model=schemas.MaintenanceResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance(payload: schemas.MaintenanceCreate, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.status == VehicleStatus.ON_TRIP:
        raise HTTPException(status_code=400, detail="Cannot send an active On Trip vehicle to maintenance")

    log = models.MaintenanceLog(
        vehicle_id=payload.vehicle_id,
        description=payload.description,
        cost=payload.cost,
        status=MaintenanceStatus.ACTIVE,
    )
    db.add(log)

    # Rule: creating an active maintenance record auto-switches vehicle to In Shop
    vehicle.status = VehicleStatus.IN_SHOP

    db.commit()
    db.refresh(log)
    return log


@router.get("", response_model=List[schemas.MaintenanceResponse])
def list_maintenance(db: Session = Depends(get_db)):
    return db.query(models.MaintenanceLog).all()


@router.post("/{log_id}/close", response_model=schemas.MaintenanceResponse)
def close_maintenance(log_id: int, db: Session = Depends(get_db)):
    log = db.query(models.MaintenanceLog).filter(models.MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    if log.status == MaintenanceStatus.CLOSED:
        raise HTTPException(status_code=400, detail="Maintenance log already closed")

    log.status = MaintenanceStatus.CLOSED
    log.closed_at = datetime.utcnow()

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == log.vehicle_id).first()
    # Rule: closing maintenance restores vehicle to Available, unless retired
    if vehicle.status != VehicleStatus.RETIRED:
        # Only restore if there's no OTHER active maintenance log on this vehicle
        other_active = db.query(models.MaintenanceLog).filter(
            models.MaintenanceLog.vehicle_id == vehicle.id,
            models.MaintenanceLog.status == MaintenanceStatus.ACTIVE,
            models.MaintenanceLog.id != log.id,
        ).first()
        if not other_active:
            vehicle.status = VehicleStatus.AVAILABLE

    db.commit()
    db.refresh(log)
    return log
