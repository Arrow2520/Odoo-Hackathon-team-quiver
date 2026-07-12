import uuid
from datetime import date, datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend import models, schemas
from backend.enums import VehicleStatus, DriverStatus, TripStatus

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("", response_model=schemas.TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(payload: schemas.TripCreate, db: Session = Depends(get_db)):
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == payload.vehicle_id).first()
    driver = db.query(models.Driver).filter(models.Driver.id == payload.driver_id).first()

    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    # Rule: Retired/In Shop vehicles never appear in dispatch selection
    if vehicle.status not in (VehicleStatus.AVAILABLE,):
        raise HTTPException(status_code=400, detail=f"Vehicle status is '{vehicle.status.value}', not available for trips")

    # Rule: expired license or suspended driver cannot be assigned
    if driver.status != DriverStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail=f"Driver status is '{driver.status.value}', not available for trips")
    
    # FIXED: Check license_expiry instead of license_expiry_date
    if driver.license_expiry < date.today():
        raise HTTPException(status_code=400, detail="Driver's license has expired")

    # Rule: cargo weight must not exceed max load capacity
    if payload.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Cargo weight {payload.cargo_weight}kg exceeds vehicle capacity {vehicle.max_load_capacity}kg",
        )

    # FIXED: Generate missing trip_code dynamically
    generated_code = f"TRP-{uuid.uuid4().hex[:8].upper()}"

    trip = models.Trip(
        trip_code=generated_code,
        source=payload.source,
        destination=payload.destination,
        vehicle_id=payload.vehicle_id,
        driver_id=payload.driver_id,
        cargo_weight=payload.cargo_weight,
        planned_distance=payload.planned_distance,
        revenue=payload.revenue,
        status=TripStatus.DRAFT,
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.get("", response_model=List[schemas.TripResponse])
def list_trips(status_filter: Optional[TripStatus] = None, db: Session = Depends(get_db)):
    query = db.query(models.Trip)
    if status_filter:
        query = query.filter(models.Trip.status == status_filter)
    return query.all()


@router.get("/{trip_id}", response_model=schemas.TripDetailResponse)
def get_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("/{trip_id}/dispatch", response_model=schemas.TripResponse)
def dispatch_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != TripStatus.DRAFT:
        raise HTTPException(status_code=400, detail=f"Cannot dispatch a trip in '{trip.status.value}' state")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
    driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()

    # Re-check availability at dispatch time (state may have changed since creation)
    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Vehicle is no longer available")
    if driver.status != DriverStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Driver is no longer available")

    trip.status = TripStatus.DISPATCHED
    # FIXED: Replaced dispatched_at with dispatch_time
    trip.dispatch_time = datetime.utcnow()
    
    vehicle.status = VehicleStatus.ON_TRIP
    driver.status = DriverStatus.ON_TRIP

    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/complete", response_model=schemas.TripResponse)
def complete_trip(trip_id: int, payload: schemas.TripComplete, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != TripStatus.DISPATCHED:
        raise HTTPException(status_code=400, detail=f"Cannot complete a trip in '{trip.status.value}' state")

    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
    driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()

    trip.status = TripStatus.COMPLETED
    # FIXED: Replaced completed_at with completion_time
    trip.completion_time = datetime.utcnow()
    trip.actual_distance = payload.actual_distance
    trip.fuel_consumed = payload.fuel_consumed

    vehicle.odometer += payload.actual_distance
    vehicle.status = VehicleStatus.AVAILABLE
    driver.status = DriverStatus.AVAILABLE

    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/cancel", response_model=schemas.TripResponse)
def cancel_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(models.Trip).filter(models.Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status not in (TripStatus.DRAFT, TripStatus.DISPATCHED):
        raise HTTPException(status_code=400, detail=f"Cannot cancel a trip in '{trip.status.value}' state")

    was_dispatched = trip.status == TripStatus.DISPATCHED
    trip.status = TripStatus.CANCELLED

    if was_dispatched:
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == trip.vehicle_id).first()
        driver = db.query(models.Driver).filter(models.Driver.id == trip.driver_id).first()
        vehicle.status = VehicleStatus.AVAILABLE
        driver.status = DriverStatus.AVAILABLE

    db.commit()
    db.refresh(trip)
    return trip