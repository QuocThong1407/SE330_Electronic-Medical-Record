INSERT INTO icd_codes (id, name, category, description) VALUES
('A00', 'Cholera', 'Infectious and parasitic diseases', 'Acute intestinal infection caused by Vibrio cholerae.'),
('A01', 'Typhoid and paratyphoid fevers', 'Infectious and parasitic diseases', 'Systemic infection caused by Salmonella.'),
('B20', 'HIV disease', 'Infectious and parasitic diseases', 'Human immunodeficiency virus disease.'),
('C34', 'Malignant neoplasm of bronchus and lung', 'Neoplasms', 'Primary lung cancer.'),
('E11', 'Type 2 diabetes mellitus', 'Endocrine, nutritional and metabolic diseases', 'Non-insulin-dependent diabetes mellitus.'),
('I10', 'Essential (primary) hypertension', 'Diseases of the circulatory system', 'Primary hypertension.'),
('J45', 'Asthma', 'Diseases of the respiratory system', 'Chronic inflammatory disease of the airways.'),
('M54', 'Dorsalgia', 'Diseases of the musculoskeletal system', 'Back pain.');

INSERT INTO appointments (appointment_no, patient_id, doctor_id, department_id, appointment_time, duration_minutes, status, reason, patient_notes, doctor_notes, cancelled_reason, cancelled_by, confirmed_at, created_at, updated_at) VALUES
('APT-0001', 101, 201, 10, '2026-05-22 09:30:00', 30, 'CONFIRMED', 'Cough and fever', 'Symptoms for 3 days', 'Assess for infection', NULL, NULL, '2026-05-21 16:00:00', '2026-05-21 15:30:00', '2026-05-21 16:00:00'),
('APT-0002', 102, 202, 12, '2026-05-22 10:15:00', 45, 'COMPLETED', 'Follow-up diabetes', 'Bring lab results', 'Adjust medication', NULL, NULL, '2026-05-20 10:00:00', '2026-05-20 09:40:00', '2026-05-22 11:15:00'),
('APT-0003', 103, 203, 15, '2026-05-23 14:00:00', 20, 'PENDING', 'Back pain', 'Lower back discomfort', NULL, NULL, NULL, NULL, '2026-05-22 09:00:00', '2026-05-22 09:00:00');

INSERT INTO medical_records (record_no, appointment_id, patient_id, doctor_id, department_id, visit_date, chief_complaint, present_illness, assessment, treatment_plan, status, is_confidential, created_at, updated_at) VALUES
('MR-0001', 1, 101, 201, 10, '2026-05-22 09:40:00', 'Cough and fever', 'Intermittent fever and cough', 'Suspected respiratory infection', 'Order CBC and prescribe antibiotics', 'COMPLETED', FALSE, '2026-05-22 10:05:00', '2026-05-22 10:05:00'),
('MR-0002', 2, 102, 202, 12, '2026-05-22 10:20:00', 'Diabetes follow-up', 'Stable glucose with occasional spikes', 'Type 2 diabetes mellitus', 'Adjust metformin dose', 'COMPLETED', FALSE, '2026-05-22 11:10:00', '2026-05-22 11:10:00');

INSERT INTO vital_signs (medical_record_id, temperature, heart_rate, blood_pressure, height, weight, bmi, created_at) VALUES
(1, 38.2, 92, 120, 170.0, 68.5, 23.7, '2026-05-22 09:45:00'),
(2, 36.8, 78, 130, 165.0, 72.0, 26.4, '2026-05-22 10:25:00');

INSERT INTO medical_record_diagnoses (medical_record_id, icd_code_id, custom_diagnosis, diagnosis_type, notes, created_at) VALUES
(1, 'J45', NULL, 'PRIMARY', 'Wheezing noted', '2026-05-22 10:00:00'),
(1, 'A01', NULL, 'RULE_OUT', 'Await lab results', '2026-05-22 10:00:00'),
(2, 'E11', NULL, 'PRIMARY', 'Long-term management', '2026-05-22 11:05:00'),
(2, 'I10', NULL, 'SECONDARY', 'Monitor blood pressure', '2026-05-22 11:05:00');
