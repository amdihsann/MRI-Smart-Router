from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from database import get_db, engine, SessionLocal
from sqlalchemy.orm import Session

import datetime
import pandas as pd
import numpy as np
import joblib
import models
import os
import math

models.Base.metadata.create_all(bind=engine)

def seed_all_databases_from_csv():
    db: Session = SessionLocal()
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    
    try:
        hospital_count = db.query(models.Hospitals).count()

        if hospital_count == 0:
            CSV_HOSPITAL_PATH = os.path.join(BASE_DIR, "master_hospitals.csv")
            
            if os.path.exists(CSV_HOSPITAL_PATH):
                df_hospitals = pd.read_csv(CSV_HOSPITAL_PATH)
                for _, row in df_hospitals.iterrows():
                    new_hospital = models.Hospitals(
                        id_rs=str(row['id_rs']),
                        nama_rs=str(row['nama_rs']),
                        wilayah=str(row['wilayah']),
                        latitude=float(row['latitude']),
                        longitude=float(row['longitude']),
                        jumlah_mri=int(row['jumlah_mri']),
                        current_occupancy=int(row['current_occupancy']),
                        max_capacity=int(row['max_capacity'])
                    )
                    db.add(new_hospital)
                db.commit()
                print(f"SUCCESS: {len(df_hospitals)} data Rumah Sakit berhasil di-import!")
            else:
                print(f"ERROR: File {CSV_HOSPITAL_PATH} tidak ditemukan!")
        else:
            print(f"ℹ️ DB Info: Tabel Hospitals sudah aman ({hospital_count} baris data).")

        patient_count = db.query(models.PatientQueues).count()
        if patient_count == 0:
            CSV_PATIENT_PATH = os.path.join(BASE_DIR, "patient_queues.csv")
            
            if os.path.exists(CSV_PATIENT_PATH):
                df_patients = pd.read_csv(CSV_PATIENT_PATH)
                for _, row in df_patients.iterrows():
                    new_patient = models.PatientQueues(
                        id_pasien=str(row['id_pasien']),
                        id_rs=str(row['id_rs']),
                        nama=str(row['nama']),
                        tipe_kasus=str(row['tipe_kasus']),
                        status_prioritas=int(row['status_prioritas']),
                        waktu_masuk=str(row['waktu_masuk']),
                        durasi_menit=int(row['durasi_menit'])
                    )
                    db.add(new_patient)
                db.commit()
                print(f"SUCCESS: {len(df_patients)} data Antrean Pasien berhasil di-import!")
            else:
                print(f"ERROR: File {CSV_PATIENT_PATH} tidak ditemukan!")
        else:
            print(f"ℹ️ DB Info: Tabel PatientQueues sudah aman ({patient_count} baris data).")

    except Exception as e:
        db.rollback()
        print(f"GAGAL MELAKUKAN AUTO-SEEDING DATABASE: {str(e)}")
    finally:
        db.close()

seed_all_databases_from_csv()

app = FastAPI(title="smart-mri-router")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "arima_model.joblib")

try:
    arima_model = joblib.load(MODEL_PATH)
    print("success")
except Exception as e:
    print(f"fail {e}")

def check_surge(date_val):
    if (date_val.month == 12 and date_val.day >= 20) or (date_val.month == 1 and date_val.day <= 5):
        return 1
    
    if date_val.year == 2026 and date_val.month == 3 and (20 <= date_val.day <= 30):
        return 1
    return 0

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    # Mengubah derajat ke radian
    rad_lat1 = math.radians(lat1)
    rad_lon1 = math.radians(lon1)
    rad_lat2 = math.radians(lat2)
    rad_lon2 = math.radians(lon2)
    
    # Selisih koordinat
    dlat = rad_lat2 - rad_lat1
    dlon = rad_lon2 - rad_lon1
    
    # Rumus Inti Haversine
    a = math.sin(dlat / 2)**2 + math.cos(rad_lat1) * math.cos(rad_lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius bumi dalam kilometer adalah 6371
    km = 6371 * c
    return km

class LoadBallanceResult(BaseModel):
    status: str
    massage: str
    pasien_dialihkan: list
    status_rs_sekitar: list

#api end point GET
@app.get("/")
def root():
    return{
        "status": "online",
        "model_laoded": arima_model is not None,
        "massage": "Smart router MRI running properly"    
    }

LAST_TRAINING_DATE = datetime.date(2026, 5, 1)
@app.get("/api/v1/forecast")
def get_mri_forecast(date: Optional[str] = None):
    if not arima_model:
        raise HTTPException(status_code=500, detail="model tidak tersedia")
    
    if not date:
        date = datetime.date.today().strftime("%Y-%m-%d")

    try:
        parsed_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()

        days_difference = (parsed_date - LAST_TRAINING_DATE).days

        if days_difference <= 0:
            raise ValueError(f"Tanggal target ({date}) harus lebih maju dari tanggal akhir latihan ({LAST_TRAINING_DATE})")
        
        exog_list = []
        date_indices = []

        for i in range(1, days_difference + 1):
            loop_date = LAST_TRAINING_DATE + datetime.timedelta(days=i)
            
            day_of_week = loop_date.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            
            # Berikan objek loop_date yang konsisten ke fungsi check_surge
            is_surge_val = check_surge(loop_date)
            is_payday = 1 if (25 <= loop_date.day <= 31) or (1 <= loop_date.day <= 5) else 0
            
            exog_list.append({
                "day_of_week": day_of_week,
                "is_weekend": is_weekend,
                "is_surge": is_surge_val,
                "is_payday": is_payday
            })
            date_indices.append(pd.to_datetime(loop_date))
            
        exog_data = pd.DataFrame(exog_list, index=date_indices)
        exog_data.index.freq = 'D'

        prediction_result = arima_model.forecast(steps=days_difference, exog=exog_data)

        if hasattr(prediction_result, "iloc"):
            predicted_raw = prediction_result.iloc[-1]
        elif isinstance(prediction_result, (list, np.ndarray)):
            predicted_raw = prediction_result[-1]
        else:
            predicted_raw = prediction_result

        predicted_total = round(float(predicted_raw))

        return {
            "target_date": date,
            "steps_calculated": days_difference,
            "feature_engineering_applied": {
                "day_of_week": int(parsed_date.weekday()),
                "is_weekend": bool(parsed_date.weekday() >= 5),
                "is_surge_active": bool(check_surge(parsed_date)),
                "is_payday_active": bool((25 <= parsed_date.day <= 31) or (1 <= parsed_date.day <= 5))
            },
            "predicted_total_patients": predicted_total,
            "facility_max_capacity": 55,
            "status": "OVERLOAD_WARNING" if predicted_total > 55 else "SAFE_NORMAL"
        }
    
    except Exception as e:
        import traceback
        print("🔴 DETAIL KEGAGALAN MATEMATIKA ARIMA:")
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"ARIMA_CALCULATION_ERROR: {str(e)}")
    
@app.get("/api/v1/hospital/realtime")
def get_realtime_hospitals(db: Session = Depends(get_db)):
    try:
        hospitals = db.query(models.Hospitals).all()
        return hospitals
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"gagal mengambil db hospital {str(e)}")
    
@app.get("/api/v1/patients")
def get_patient_queues(db: Session = Depends(get_db)):
    try:
        patients = db.query(models.PatientQueues).all()
        return patients
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"gagal mengambil db pasien {str(e)}")
    

@app.post("/api/v1/load-balance")
def execute_load_balancing(db: Session = Depends(get_db)):
    try:
        fatmawati = db.query(models.Hospitals).filter(models.Hospitals.id_rs == "RS_020").first()
        
        if not fatmawati:
            raise HTTPException(status_code=404, detail="Data RSUP Fatmawati tidak ditemukan di database")
        
        overload_count = fatmawati.current_occupancy - fatmawati.max_capacity

        if overload_count <= 0:
            return {
                "status": "safe",
                "message": "Kapasitas di RSUP Fatmawati aman. Tidak ada pasien yang perlu dialihkan.",
                "pasien_dialihkan": [],
                "logs_pencarian_spasial": []
            } 
        
        patients_to_route = db.query(models.PatientQueues).filter(
            models.PatientQueues.id_rs == "RS_020",
            models.PatientQueues.status_prioritas == 0
        ).limit(overload_count).all()

        rs_neighbors = db.query(models.Hospitals).filter(
            models.Hospitals.id_rs != "RS_020"
        ).all()

        fatmawati_lat = fatmawati.latitude
        fatmawati_lon = fatmawati.longitude

        for rs in rs_neighbors:
            rs.distance_from_hub = calculate_haversine_distance(
                fatmawati_lat, fatmawati_lon, 
                float(rs.latitude), float(rs.longitude)
            )

        rs_neighbors.sort(key=lambda x: x.distance_from_hub)

        allocated_patients = []
        neighbor_status_log = []
        actual_diverted_count = 0

        for patient in patients_to_route:
            assigned = False
            
            for target_rs in rs_neighbors:
                if target_rs.current_occupancy < target_rs.max_capacity:
                    target_rs.current_occupancy += 1
                    assigned = True
                    actual_diverted_count += 1

                    allocated_patients.append({
                        "id_pasien": patient.id_pasien,
                        "nama_pasien": patient.nama,
                        "kasus": patient.tipe_kasus,
                        "rs_asal": "RSUP Fatmawati",
                        "rs_tujuan": target_rs.nama_rs,
                        "jarak_km": round(target_rs.distance_from_hub, 2),
                        "alasan": f"Dialihkan otomatis ke RS terdekat ({round(target_rs.distance_from_hub, 2)} KM) yang slotnya tersedia."
                    })
                    break
                else:
                    log_exist = any(log['nama_rs'] == target_rs.nama_rs for log in neighbor_status_log)
                    if not log_exist:
                        neighbor_status_log.append({
                            "nama_rs": target_rs.nama_rs,
                            "jarak_km": round(target_rs.distance_from_hub, 2),
                            "status": "PENUH",
                            "keterangan": "Sistem otomatis melewati faskes ini karena kuota tempat tidur full"
                        })

            if not assigned:
                allocated_patients.append({
                    "id_pasien": patient.id_pasien,
                    "nama_pasien": patient.nama,
                    "rs_asal": "RSUP Fatmawati",
                    "rs_tujuan": "Gagal Dialihkan",
                    "alasan": "Kritis! Seluruh jaringan rumah sakit mitra di area pemetaan sudah penuh total."
                })

        fatmawati.current_occupancy -= actual_diverted_count
        
        db.commit()

        return {
            "status": "SUCCESS_REROUTED",
            "message": f"Sistem Smart-Router sukses memindahkan {actual_diverted_count} pasien keluar dari Fatmawati.",
            "pasien_dialihkan": allocated_patients,
            "logs_pencarian_spasial": neighbor_status_log
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal memproses kalkulasi spasial load balancing: {str(e)}")

class HospitalUpdateInput(BaseModel):
    current_occupancy: int 

@app.put("/api/v1/hospital/{id_rs}")
def update_hospital_occupancy(id_rs: str, input_data: HospitalUpdateInput, db:Session = Depends(get_db)):
    hospital = db.query(models.Hospitals).filter(models.Hospitals.id_rs == id_rs). first()

    if not hospital:
        raise HTTPException(status_code=404, detail="id rumah sakit tidak ditemukan")

    try:
        hospital.current_occupancy = input_data.current_occupancy
        db.commit()
        return {
            "status": "updated",
            "nama_rs": hospital.nama_rs,
            "current_occupancy_new": hospital.current_occupancy
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/database/reset")
def reset_database_simulation(db: Session = Depends(get_db)):
    try:
        initial_states = {
            "RS_020": 25,  # Fatmawati 
            "RS_013": 48,  # Siloam 
            "RS_016": 18,  # Mayapada 
            "RS_012": 40,   # RSUD Pasming 
            "RS_017": 39    # RSPI 
        }
        
        for id_rs, occupancy in initial_states.items():
            hospital = db.query(models.Hospitals).filter(models.Hospitals.id_rs == id_rs).first()
            if hospital:
                hospital.current_occupancy = occupancy
        
        db.commit()
        return {
            "status": "RESET_SUCCESS", 
            "message": "Database berhasil dikembalikan ke kondisi awal simulasi."
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/v1/database/simulate-surge")
def simulate_surge_condition(db: Session = Depends(get_db)):
    try:
        surge_states = {
            "RS_020": 60,  # Fatmawati (Max 55)
            "RS_013": 52,  # Siloam (Max 50)
            "RS_016": 45,  # Mayapada (Max 45) ->
            "RS_012": 32,  # RSUD Pasming (Max 40)
            "RS_017": 20   # RSPI (Max 42) ->
        }
        
        for id_rs, occupancy in surge_states.items():
            hospital = db.query(models.Hospitals).filter(models.Hospitals.id_rs == id_rs).first()
            if hospital:
                hospital.current_occupancy = occupancy
        
        db.commit()
        return {
            "status": "SURGE_SIMULATION_ACTIVE", 
            "message": "Kondisi lonjakan pasien diaktifkan! RSUP Fatmawati terdeteksi Overload."
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal mengaktifkan simulasi gejolak: {str(e)}")
        
