import csv
import io
from typing import List, Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend import models, schemas
from backend.enums import VehicleStatus, DriverStatus, TripStatus

router = APIRouter(tags=["Reports"])


@router.get("/dashboard", response_model=schemas.DashboardKPIs)
def dashboard(
    vehicle_type: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
):
    vq = db.query(models.Vehicle)
    if vehicle_type:
        vq = vq.filter(models.Vehicle.type == vehicle_type)
    if region:
        vq = vq.filter(models.Vehicle.region == region)

    vehicles = vq.all()
    total_vehicles = len(vehicles)
    active_vehicles = sum(1 for v in vehicles if v.status != VehicleStatus.RETIRED)
    available_vehicles = sum(1 for v in vehicles if v.status == VehicleStatus.AVAILABLE)
    in_maintenance = sum(1 for v in vehicles if v.status == VehicleStatus.IN_SHOP)
    on_trip = sum(1 for v in vehicles if v.status == VehicleStatus.ON_TRIP)

    active_trips = db.query(models.Trip).filter(models.Trip.status == TripStatus.DISPATCHED).count()
    pending_trips = db.query(models.Trip).filter(models.Trip.status == TripStatus.DRAFT).count()
    drivers_on_duty = db.query(models.Driver).filter(models.Driver.status == DriverStatus.ON_TRIP).count()

    fleet_utilization = (on_trip / total_vehicles * 100) if total_vehicles else 0.0

    return schemas.DashboardKPIs(
        active_vehicles=active_vehicles,
        available_vehicles=available_vehicles,
        vehicles_in_maintenance=in_maintenance,
        active_trips=active_trips,
        pending_trips=pending_trips,
        drivers_on_duty=drivers_on_duty,
        fleet_utilization_percent=round(fleet_utilization, 2),
    )


def _compute_vehicle_reports(db: Session) -> List[schemas.VehicleReport]:
    vehicles = db.query(models.Vehicle).all()
    reports = []

    for v in vehicles:
        fuel_cost = db.query(func.coalesce(func.sum(models.FuelLog.cost), 0.0)).filter(
            models.FuelLog.vehicle_id == v.id
        ).scalar()
        fuel_liters = db.query(func.coalesce(func.sum(models.FuelLog.liters), 0.0)).filter(
            models.FuelLog.vehicle_id == v.id
        ).scalar()
        maintenance_cost = db.query(func.coalesce(func.sum(models.MaintenanceLog.cost), 0.0)).filter(
            models.MaintenanceLog.vehicle_id == v.id
        ).scalar()
        expense_cost = db.query(func.coalesce(func.sum(models.Expense.amount), 0.0)).filter(
            models.Expense.vehicle_id == v.id
        ).scalar()
        total_distance = db.query(func.coalesce(func.sum(models.Trip.actual_distance), 0.0)).filter(
            models.Trip.vehicle_id == v.id, models.Trip.status == TripStatus.COMPLETED
        ).scalar()
        total_revenue = db.query(func.coalesce(func.sum(models.Trip.revenue), 0.0)).filter(
            models.Trip.vehicle_id == v.id, models.Trip.status == TripStatus.COMPLETED
        ).scalar()

        operational_cost = fuel_cost + maintenance_cost
        fuel_efficiency = (total_distance / fuel_liters) if fuel_liters else None
        roi = ((total_revenue - operational_cost) / v.acquisition_cost) if v.acquisition_cost else None

        reports.append(schemas.VehicleReport(
            vehicle_id=v.id,
            registration_number=v.registration_number,
            total_fuel_cost=round(fuel_cost, 2),
            total_maintenance_cost=round(maintenance_cost, 2),
            total_expense_cost=round(expense_cost, 2),
            operational_cost=round(operational_cost, 2),
            fuel_efficiency=round(fuel_efficiency, 2) if fuel_efficiency is not None else None,
            roi=round(roi, 4) if roi is not None else None,
        ))

    return reports


@router.get("/reports/vehicles", response_model=List[schemas.VehicleReport])
def vehicle_reports(db: Session = Depends(get_db)):
    return _compute_vehicle_reports(db)


@router.get("/reports/vehicles/export")
def export_vehicle_reports_csv(db: Session = Depends(get_db)):
    reports = _compute_vehicle_reports(db)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "Vehicle ID", "Registration Number", "Total Fuel Cost", "Total Maintenance Cost",
        "Total Expense Cost", "Operational Cost", "Fuel Efficiency (dist/fuel)", "ROI"
    ])
    for r in reports:
        writer.writerow([
            r.vehicle_id, r.registration_number, r.total_fuel_cost, r.total_maintenance_cost,
            r.total_expense_cost, r.operational_cost, r.fuel_efficiency, r.roi
        ])

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vehicle_reports.csv"},
    )
