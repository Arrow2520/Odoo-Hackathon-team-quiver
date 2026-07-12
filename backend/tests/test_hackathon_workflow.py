import pytest
from datetime import date, timedelta

def test_transitops_hackathon_example_workflow(client, auth_headers):
    # -------------------------------------------------------------------------
    # Step 1: Register a vehicle 'Van-05' with a max capacity of 500 kg.
    # Status = Available.
    # -------------------------------------------------------------------------
    vehicle_payload = {
        "registration_number": "Van-05",
        "model": "Delivery Van",
        "vehicle_type": "Van",
        "max_load_capacity": 500.0,
        "acquisition_cost": 25000.0,
        "region": "West Region"
    }
    v_res = client.post("/vehicles", json=vehicle_payload, headers=auth_headers)
    assert v_res.status_code == 201
    vehicle = v_res.json()
    assert vehicle["status"] == "AVAILABLE"
    vehicle_id = vehicle["id"]

    # -------------------------------------------------------------------------
    # Step 2: Register driver 'Alex' with a valid driving license.
    # -------------------------------------------------------------------------
    future_expiry = (date.today() + timedelta(days=200)).isoformat()
    driver_payload = {
        "name": "Alex",
        "license_number": "LIC-ALEX-77",
        "license_category": "Class B",
        "license_expiry": future_expiry,
        "phone": "+15550199"
    }
    d_res = client.post("/drivers", json=driver_payload, headers=auth_headers)
    assert d_res.status_code == 201
    driver = d_res.json()
    assert driver["status"] == "AVAILABLE"
    driver_id = driver["id"]

    # -------------------------------------------------------------------------
    # Step 3: Create a trip with Cargo Weight = 450 kg.
    # Step 4: System validates that 450 kg <= 500 kg and allows dispatch.
    # -------------------------------------------------------------------------
    trip_payload = {
        "source": "Central Hub",
        "destination": "Downtown Outlet",
        "vehicle_id": vehicle_id,
        "driver_id": driver_id,
        "cargo_weight": 450.0,
        "planned_distance": 80.0,
        "revenue": 600.0
    }
    t_res = client.post("/trips", json=trip_payload, headers=auth_headers)
    assert t_res.status_code == 201
    trip = t_res.json()
    assert trip["status"] == "DRAFT"
    trip_id = trip["id"]

    # -------------------------------------------------------------------------
    # Step 5: Dispatch trip -> Vehicle and Driver status automatically become On Trip.
    # -------------------------------------------------------------------------
    disp_res = client.post(f"/trips/{trip_id}/dispatch", headers=auth_headers)
    assert disp_res.status_code == 200
    assert disp_res.json()["status"] == "DISPATCHED"

    # Verify both assets auto-transition to ON_TRIP
    v_status = client.get(f"/vehicles/{vehicle_id}", headers=auth_headers).json()["status"]
    d_status = client.get(f"/drivers/{driver_id}", headers=auth_headers).json()["status"]
    assert v_status == "ON_TRIP"
    assert d_status == "ON_TRIP"

    # -------------------------------------------------------------------------
    # Step 6: Complete the trip by entering the final odometer and fuel consumed.
    # Step 7: System marks both Vehicle and Driver as Available.
    # -------------------------------------------------------------------------
    complete_payload = {
        "actual_distance": 82.5,
        "fuel_consumed": 11.0
    }
    comp_res = client.post(f"/trips/{trip_id}/complete", json=complete_payload, headers=auth_headers)
    assert comp_res.status_code == 200
    assert comp_res.json()["status"] == "COMPLETED"

    # Verify both assets reset to AVAILABLE
    v_status_after = client.get(f"/vehicles/{vehicle_id}", headers=auth_headers).json()["status"]
    d_status_after = client.get(f"/drivers/{driver_id}", headers=auth_headers).json()["status"]
    assert v_status_after == "AVAILABLE"
    assert d_status_after == "AVAILABLE"

    # Log a fuel record to reflect fuel costs for Step 9 analytics calculations
    fuel_payload = {
        "vehicle_id": vehicle_id,
        "trip_id": trip_id,
        "liters": 11.0,
        "cost": 45.0,
        "odometer": 82.5,
        "fuel_date": date.today().isoformat()
    }
    client.post("/fuel-logs", json=fuel_payload, headers=auth_headers)

    # -------------------------------------------------------------------------
    # Step 8: Create a maintenance record (e.g., Oil Change).
    # Vehicle status automatically becomes In Shop and is hidden from dispatch.
    # -------------------------------------------------------------------------
    maint_payload = {
        "vehicle_id": vehicle_id,
        "service_type": "Oil Change",
        "description": "Routine 5k mile interval check",
        "cost": 120.0
    }
    m_res = client.post("/maintenance", json=maint_payload, headers=auth_headers)
    assert m_res.status_code == 201
    
    # Confirm vehicle is locked inside the workshop
    v_maint_status = client.get(f"/vehicles/{vehicle_id}", headers=auth_headers).json()["status"]
    assert v_maint_status == "IN_SHOP"

    # Confirm it is excluded from the dispatch pool
    pool_res = client.get("/vehicles/dispatch-pool", headers=auth_headers)
    pool_ids = [v["id"] for v in pool_res.json()]
    assert vehicle_id not in pool_ids

    # -------------------------------------------------------------------------
    # Step 9: Reports update operational cost and fuel efficiency.
    # -------------------------------------------------------------------------
    report_res = client.get("/reports/vehicles", headers=auth_headers)
    assert report_res.status_code == 200
    
    target_report = next(r for r in report_res.json() if r["vehicle_id"] == vehicle_id)
    
    # Fuel Cost (45.0) + Maintenance Cost (120.0) = 165.0
    assert target_report["total_fuel_cost"] == 45.0
    assert target_report["total_maintenance_cost"] == 120.0
    assert target_report["operational_cost"] == 165.0
    
    # Fuel Efficiency = 82.5 actual_distance / 11.0 liters = 7.50
    assert target_report["fuel_efficiency"] == 7.50