CREATE TABLE department (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    type VARCHAR(16) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uq_department_name_type UNIQUE (name, type),
    CONSTRAINT chk_department_type CHECK (type IN ('DEPARTMENT', 'DIVISION')),
    INDEX idx_department_active (active)
);

CREATE TABLE employee (
    id BIGINT NOT NULL AUTO_INCREMENT,
    full_name VARCHAR(160) NOT NULL,
    work_email VARCHAR(254),
    department_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    CONSTRAINT uq_employee_work_email UNIQUE (work_email),
    CONSTRAINT fk_employee_department FOREIGN KEY (department_id)
        REFERENCES department (id) ON DELETE RESTRICT,
    INDEX idx_employee_department (department_id),
    INDEX idx_employee_active (active)
);
