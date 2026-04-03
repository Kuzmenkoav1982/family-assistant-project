CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.garage_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    make VARCHAR(100),
    model VARCHAR(100),
    year INT,
    color VARCHAR(50),
    license_plate VARCHAR(50),
    vin VARCHAR(50),
    mileage INT DEFAULT 0,
    photo_url TEXT,
    responsible_member_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.garage_service_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    family_id UUID NOT NULL,
    service_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    mileage INT,
    cost DECIMAL(12, 2) DEFAULT 0,
    service_station VARCHAR(255),
    parts_replaced TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.garage_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    family_id UUID NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.garage_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    family_id UUID NOT NULL,
    reminder_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    due_mileage INT,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS t_p5815085_family_assistant_pro.garage_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    family_id UUID NOT NULL,
    author_name VARCHAR(100),
    text TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal',
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_garage_vehicles_family ON t_p5815085_family_assistant_pro.garage_vehicles(family_id);
CREATE INDEX idx_garage_service_vehicle ON t_p5815085_family_assistant_pro.garage_service_records(vehicle_id);
CREATE INDEX idx_garage_expenses_vehicle ON t_p5815085_family_assistant_pro.garage_expenses(vehicle_id);
CREATE INDEX idx_garage_reminders_vehicle ON t_p5815085_family_assistant_pro.garage_reminders(vehicle_id);
CREATE INDEX idx_garage_notes_vehicle ON t_p5815085_family_assistant_pro.garage_notes(vehicle_id);