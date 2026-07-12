from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.enums import VehicleStatus, UserRole
from backend.auth import require_roles

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.post("", response_model=schemas.VehicleResponse, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: schemas.VehicleCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    existing = db.query(models.Vehicle).filter(
        models.Vehicle.registration_number == payload.registration_number
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration number already exists")

    vehicle = models.Vehicle(**payload.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("", response_model=List[schemas.VehicleResponse])
def list_vehicles(
    status_filter: Optional[VehicleStatus] = None,
    type_filter: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST))
):
    query = db.query(models.Vehicle)
    if status_filter:
        query = query.filter(models.Vehicle.status == status_filter)
    if type_filter:
        query = query.filter(models.Vehicle.vehicle_type == type_filter)  
    if region:
        query = query.filter(models.Vehicle.region == region)
    return query.all()


@router.get("/dispatch-pool", response_model=List[schemas.VehicleResponse])
def get_dispatchable_vehicles(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER, UserRole.DRIVER))
):
    return db.query(models.Vehicle).filter(
        models.Vehicle.status == VehicleStatus.AVAILABLE
    ).all()


@router.get("/{vehicle_id}", response_model=schemas.VehicleResponse)
def get_vehicle(
    vehicle_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER, UserRole.DRIVER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST))
):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.patch("/{vehicle_id}", response_model=schemas.VehicleResponse)
def update_vehicle(
    vehicle_id: int, 
    payload: schemas.VehicleUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return None