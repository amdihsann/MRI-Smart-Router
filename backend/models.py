from sqlalchemy import Column, Integer, String, Float, Date, Time, ForeignKey
from database import Base

class Hospitals(Base):
    __tablename__ = "master_hospitals"

    id_rs = Column(String(50), primary_key=True, index=True)
    nama_rs = Column(String(255), nullable=False)
    wilayah = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    jumlah_mri = Column(Integer, nullable=False)
    current_occupancy = Column(Integer, nullable=False)
    max_capacity = Column(Integer, nullable=False)

class PatientQueues(Base):
    __tablename__ = "patient_queues"

    id_pasien = Column(String(50), primary_key=True, index=True)
    id_rs = Column(String(50), ForeignKey("master_hospitals.id_rs"), default='RS_20')
    nama = Column(String(255), nullable=False)
    tipe_kasus = Column(String(255), nullable=False)
    status_prioritas = Column(Integer, nullable=False) # 1: Gawat Darurat, 0: Biasa
    waktu_masuk = Column(Time, nullable=False)
    durasi_menit = Column(Integer, nullable=False)