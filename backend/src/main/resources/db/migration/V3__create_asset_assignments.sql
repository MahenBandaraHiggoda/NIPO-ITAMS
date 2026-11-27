CREATE TABLE asset_assignment (
    id BIGINT NOT NULL AUTO_INCREMENT,
    asset_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    assigned_date DATE NOT NULL,
    returned_date DATE,
    active_asset_id BIGINT GENERATED ALWAYS AS (
        CASE WHEN returned_date IS NULL THEN asset_id ELSE NULL END
    ) STORED,
    PRIMARY KEY (id),
    CONSTRAINT fk_assignment_asset FOREIGN KEY (asset_id)
        REFERENCES asset (id) ON DELETE RESTRICT,
    CONSTRAINT fk_assignment_employee FOREIGN KEY (employee_id)
        REFERENCES employee (id) ON DELETE RESTRICT,
    CONSTRAINT uq_assignment_active_asset UNIQUE (active_asset_id),
    CONSTRAINT chk_assignment_dates CHECK (returned_date IS NULL OR returned_date >= assigned_date),
    INDEX idx_assignment_employee_active (employee_id, returned_date, assigned_date)
);
