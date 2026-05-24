CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_no VARCHAR(30) NOT NULL UNIQUE,
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE RESTRICT,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    prescribed_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(30) CHECK (frequency IN ('ONCE_DAILY','TWICE_DAILY','THREE_TIMES_DAILY','EVERY_8_HOURS','EVERY_12_HOURS','AS_NEEDED')),
    duration_days INT,
    quantity INT NOT NULL,
    unit VARCHAR(20) CHECK (unit IN ('TABLET','CAPSULE','SYRUP','ML','MG','VIAL','TUBE','PACK','BOX')),
    route VARCHAR(50),
    instructions TEXT,
    notes TEXT
);

CREATE INDEX idx_prescriptions_medical_record_id ON prescriptions(medical_record_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);