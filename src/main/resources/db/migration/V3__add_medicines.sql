CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES medicine_categories(id) ON DELETE SET NULL,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('TABLET','CAPSULE','SYRUP','ML','MG','VIAL','TUBE','PACK','BOX')),
    manufacturer VARCHAR(200),
    description TEXT,
    side_effects TEXT,
    price NUMERIC(12,2),
    stock_quantity INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_medicines_name        ON medicines(name);
CREATE INDEX idx_medicines_code        ON medicines(code);
CREATE INDEX idx_medicines_category_id ON medicines(category_id);