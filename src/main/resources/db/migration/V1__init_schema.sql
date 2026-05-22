CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    phone_ext VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    date_of_birth DATE,
    phone VARCHAR(20),
    email_contact VARCHAR(100),
    degree VARCHAR(100),
    experience_years INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE doctor_specializations (
    doctor_id UUID NOT NULL REFERENCES doctors(id),
    specialization_id UUID NOT NULL REFERENCES specializations(id),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (doctor_id, specialization_id)
);

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    patient_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    date_of_birth DATE,
    id_card_number VARCHAR(20) UNIQUE,
    insurance_number VARCHAR(30),
    insurance_exp_date DATE,
    phone VARCHAR(20),
    email_contact VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    blood_type VARCHAR(5),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_no VARCHAR(30) NOT NULL UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    appointment_time TIMESTAMP NOT NULL,
    duration_minutes INT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
    reason TEXT,
    patient_notes TEXT,
    doctor_notes TEXT,
    cancelled_reason TEXT,
    cancelled_by UUID,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE icd_codes (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(300) NOT NULL,
    category VARCHAR(100),
    description TEXT
);

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_no VARCHAR(30) NOT NULL UNIQUE,
    appointment_id UUID UNIQUE,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    visit_date TIMESTAMP NOT NULL,
    chief_complaint TEXT NOT NULL,
    present_illness TEXT,
    assessment TEXT,
    treatment_plan TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('DRAFT', 'COMPLETED', 'ARCHIVED')),
    is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_medical_records_appointment
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

CREATE TABLE vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL UNIQUE,
    temperature NUMERIC(10,2),
    heart_rate INT,
    blood_pressure INT,
    height NUMERIC(10,2),
    weight NUMERIC(10,2),
    bmi NUMERIC(10,2),
    created_at TIMESTAMP,
    CONSTRAINT fk_vital_signs_medical_record
        FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE
);

CREATE TABLE medical_record_diagnoses (
    medical_record_id UUID NOT NULL,
    icd_code_id VARCHAR(10) NOT NULL,
    custom_diagnosis TEXT,
    diagnosis_type VARCHAR(20) NOT NULL CHECK (diagnosis_type IN ('PRIMARY', 'SECONDARY', 'PROVISIONAL', 'RULE_OUT')),
    notes TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (medical_record_id, icd_code_id),
    CONSTRAINT fk_medical_record_diagnoses_record
        FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
    CONSTRAINT fk_medical_record_diagnoses_icd
        FOREIGN KEY (icd_code_id) REFERENCES icd_codes(id) ON DELETE RESTRICT
);

CREATE INDEX idx_doctors_full_name ON doctors(full_name);
CREATE INDEX idx_doctors_phone ON doctors(phone);
CREATE INDEX idx_doctors_email_contact ON doctors(email_contact);
CREATE INDEX idx_doctors_employee_code ON doctors(employee_code);

CREATE INDEX idx_patients_full_name ON patients(full_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_patient_code ON patients(patient_code);
CREATE INDEX idx_patients_id_card_number ON patients(id_card_number);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_appointment_time ON appointments(appointment_time);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_status ON medical_records(status);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);

CREATE INDEX idx_vital_signs_medical_record_id ON vital_signs(medical_record_id);
CREATE INDEX idx_medical_record_diagnoses_record_id ON medical_record_diagnoses(medical_record_id);
CREATE INDEX idx_medical_record_diagnoses_icd_code_id ON medical_record_diagnoses(icd_code_id);

INSERT INTO roles (name, description) VALUES
    ('ADMIN', 'System administrator'),
    ('DOCTOR', 'Medical doctor'),
    ('RECEPTIONIST', 'Front desk and scheduling staff'),
    ('PATIENT', 'Patient account');
