-- STUDENT MANAGEMENT SYSTEM (Normalized Design Without Rank)

-- DATABASE CREATION
CREATE DATABASE IF NOT EXISTS sms
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sms;

-- 1. ROLES
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. USERS (core authentication only)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'teacher', 'admin', 'super_admin') NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    last_login DATETIME,
    approved_by BIGINT,
    approved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_approved_by FOREIGN KEY (approved_by) REFERENCES users(id)
);

-- 3. USER PROFILES (common profile data)
CREATE TABLE user_profiles (
    user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    birthdate DATE,
    phone VARCHAR(20),
    address TEXT,
    profile_image VARCHAR(255),
    telegram_id VARCHAR(100),
    CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. ACADEMIC YEARS
CREATE TABLE academic_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- 5. STUDENT PROFILES
CREATE TABLE student_profiles (
    user_id BIGINT PRIMARY KEY,
    student_id_number VARCHAR(20) UNIQUE,
    academic_year_id INT,
    parent_contact VARCHAR(20),
    emergency_contact VARCHAR(20),
    CONSTRAINT fk_student_profiles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_student_profiles_academic_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id)
);

-- 6. TEACHER POSITIONS (simplified without rank)
CREATE TABLE teacher_positions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 7. TEACHER PROFILES
CREATE TABLE teacher_profiles (
    user_id BIGINT PRIMARY KEY,
    position_id INT,
    experience_years INT DEFAULT 0,
    specialization VARCHAR(100),
    bio TEXT,
    office_location VARCHAR(50),
    office_hours TEXT,
    CONSTRAINT fk_teacher_profiles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_teacher_profiles_position FOREIGN KEY (position_id) REFERENCES teacher_positions(id)
);

-- 8. ADMIN PROFILES
CREATE TABLE admin_profiles (
    user_id BIGINT PRIMARY KEY,
    department VARCHAR(50),
    admin_level ENUM('regular', 'super') NOT NULL DEFAULT 'regular',
    responsibilities TEXT,
    CONSTRAINT fk_admin_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 9. CATEGORIES
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 10. COURSES
CREATE TABLE courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    description TEXT,
    price DECIMAL(10, 2),
    duration_weeks INT,
    delivery_type ENUM('online', 'self_paced', 'hybrid', 'in_person') NOT NULL,
    meeting_link VARCHAR(255),
    image_url VARCHAR(255),
    created_by BIGINT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT fk_courses_creator FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 11. CLASSES
CREATE TABLE IF NOT EXISTS `classes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `course_id` INT(11) NOT NULL,
    `teacher_id` BIGINT(20) NOT NULL,
    `max_students` INT(11) DEFAULT NULL,
    `current_students` INT(11) DEFAULT 0,
    `status` ENUM('coming_soon', 'open', 'full', 'closed', 'completed') DEFAULT 'coming_soon',
    `start_time` TIME DEFAULT NULL,
    `end_time` TIME DEFAULT NULL,
    `start_date` DATE DEFAULT NULL,
    `end_date` DATE DEFAULT NULL,
    `day_of_week` ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
    `image_class` VARCHAR(255) DEFAULT NULL,
    `created_by` BIGINT(20) DEFAULT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `time_slot` ENUM('am', 'pm') NOT NULL,
    PRIMARY KEY (`id`),
    KEY `course_id` (`course_id`),
    KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- 13. PAYMENT PLANS
CREATE TABLE payment_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    plan_type ENUM('full', 'monthly', 'half', 'quarterly') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    duration_months INT,
    description TEXT,
    CONSTRAINT fk_payment_plans_course FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (course_id, plan_type)
);

-- 14. PAYMENTS
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    paid_at DATETIME,
    plan_id INT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_payments_course FOREIGN KEY (course_id) REFERENCES courses(id),
    CONSTRAINT fk_payments_plan FOREIGN KEY (plan_id) REFERENCES payment_plans(id)
);

-- 15. REGISTRATIONS
CREATE TABLE registrations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    class_id INT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'waitlisted', 'dropped') DEFAULT 'pending',
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by BIGINT,
    payment_id INT,
    completion_status ENUM('in_progress', 'completed', 'failed') DEFAULT 'in_progress',
    completion_date DATETIME,
    CONSTRAINT fk_registrations_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_registrations_class FOREIGN KEY (class_id) REFERENCES classes(id),
    CONSTRAINT fk_registrations_approver FOREIGN KEY (approved_by) REFERENCES users(id),
    CONSTRAINT fk_registrations_payment FOREIGN KEY (payment_id) REFERENCES payments(id),
    UNIQUE (student_id, class_id)
);

-- 16. CART ITEMS
CREATE TABLE cart_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_cart_items_course FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (user_id, course_id)
);

-- 17. WISHLISTS
CREATE TABLE wishlists (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    course_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_wishlists_course FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE (user_id, course_id)
);


-- 1. First, insert a role for super_admin if not exists
INSERT INTO roles (name) VALUES ('super_admin') 
ON DUPLICATE KEY UPDATE name = 'super_admin';

-- 2. Create the super-admin user account
INSERT INTO users (
    id, 
    email, 
    username, 
    password, 
    role, 
    status, 
    created_at
) VALUES (
    1,  -- Starting with ID 1 for the first admin
    'superadmin@school.edu.kh', 
    'superadmin', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- This is "password" hashed
    'super_admin', 
    'approved', 
    NOW()
);
-- admin123
INSERT INTO admin_profiles (
    user_id,
    department,
    admin_level,
    responsibilities
) VALUES (
    1,  -- Matching the user ID
    'Administration',
    'super',
    'System super administrator with full privileges'
);

-- 4. Create the user profile
INSERT INTO user_profiles (
    user_id,
    first_name,
    last_name,
    gender,
    phone
) VALUES (
    1,
    'Super',
    'Admin',
    'male',
    '+85512345678'
);

-- 5. Update the user to be self-approved (since this is the first account)
UPDATE users SET 
    approved_by = 1,
    approved_at = NOW()
WHERE id = 1;