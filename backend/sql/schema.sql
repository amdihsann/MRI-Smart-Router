CREATE TABLE master_hospitals (
    id_rs VARCHAR(50) PRIMARY KEY,
    nama_rs VARCHAR(255) NOT NULL,
    wilayah VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    jumlah_mri INT NOT NULL,
    current_occupancy INT NOT NULL,
    max_capacity INT NOT NULL
);

COPY master_hospitals(id_rs, nama_rs, wilayah, latitude, longitude, jumlah_mri, current_occupancy, max_capacity)
FROM '/tmp/master_hospitals.csv'
DELIMITER ','
CSV HEADER;

CREATE TABLE patient_queues (
    id_pasien VARCHAR(50) PRIMARY KEY,
    id_rs INT VARCHAR(50) NOT NULL REFERENCES master_hospitals(id_rs) DEFAULT 'RS_020',
    nama VARCHAR(255) NOT NULL,
    tipe_kasus VARCHAR(255) NOT NULL, 
    status_prioritas INT NOT NULL,    
    waktu_masuk TIME NOT NULL,
    durasi_menit INT NOT NULL 
);

COPY patient_queues(id_pasien, nama, tipe_kasus, status_prioritas, waktu_masuk, durasi_menit)
FROM '/tmp/patient_queues.csv'
DELIMITER ','
CSV HEADER;