from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Mengambil URL database dari environment variable yang diset di docker-compose
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://mri_admin:mri_password_secure@db:5432/smart_mri_db")

# Pembuat mesin koneksi
engine = create_engine(DATABASE_URL)

# Pembuat session untuk setiap request API
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk membuat model tabel nanti
Base = declarative_base()

# Fungsi helper (Dependency injection) untuk dipakai di main.py
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()