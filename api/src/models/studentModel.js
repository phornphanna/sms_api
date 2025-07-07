const db = require('../config/db');

class StudentModel {
    async create(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            
            // Insert user
            const [userResult] = await connection.execute(
                'INSERT INTO users (email, username, password, role, status, last_login, approved_by, approved_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [data.email, data.username, data.password, data.role, data.status, data.last_login, data.approved_by, data.approved_at, data.created_at, data.updated_at]
            );

            // Insert user profile
            await connection.execute(
                'INSERT INTO user_profiles (user_id, first_name, last_name, gender, birthdate, phone, address, profile_image, telegram_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [userResult.insertId, data.first_name, data.last_name, data.gender, data.birthdate, data.phone, data.address, data.profile_image, data.telegram_id]
            );

            // Insert student profile
            await connection.execute(
                'INSERT INTO student_profiles (user_id, student_id_number, academic_year_id, parent_contact, emergency_contact) VALUES (?, ?, ?, ?, ?)',
                [userResult.insertId, data.student_id_number, data.academic_year_id, data.parent_contact, data.emergency_contact]
            );
            
            await connection.commit();
            return {
                result: true,
                message: "Student created successfully"
            };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getById(id) {
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute(`
                SELECT 
                    u.*, 
                    up.first_name, 
                    up.last_name,
                    up.gender,
                    up.birthdate,
                    up.phone,
                    up.address,
                    up.profile_image,
                    sp.student_id_number,
                    sp.academic_year_id,
                    sp.parent_contact,
                    sp.emergency_contact,
                    ay.name AS academic_year_name
                FROM users u
                JOIN user_profiles up ON u.id = up.user_id
                JOIN student_profiles sp ON u.id = sp.user_id
                LEFT JOIN academic_years ay ON sp.academic_year_id = ay.id
                WHERE u.id = ? AND u.role = 'student'
            `, [id]);
            return result[0] || null;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAll({ 
        search = '', 
        academicYearId = null, 
        sortBy = 'u.created_at', 
        sortOrder = 'DESC', 
        page = 1, 
        limit = 10 
    } = {}) {
        const connection = await db.getConnection();
        try {
            // Validate sort order
            const validSortOrders = ['ASC', 'DESC'];
            sortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';

            // Calculate offset for pagination
            const offset = (page - 1) * limit;

            // Base query
            let query = `
                SELECT 
                    u.id,
                    u.email,
                    u.username,
                    u.status,
                    u.created_at,
                    up.first_name,
                    up.last_name,
                    up.phone,
                    sp.student_id_number,
                    sp.academic_year_id,
                    ay.name AS academic_year_name
                FROM users u
                JOIN user_profiles up ON u.id = up.user_id
                JOIN student_profiles sp ON u.id = sp.user_id
                LEFT JOIN academic_years ay ON sp.academic_year_id = ay.id
                WHERE u.role = 'student'
            `;

            const params = [];

            // Add search condition
            if (search) {
                query += ` AND (
                    u.email LIKE ? OR 
                    u.username LIKE ? OR 
                    up.first_name LIKE ? OR 
                    up.last_name LIKE ? OR 
                    sp.student_id_number LIKE ?
                )`;
                const searchTerm = `%${search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
            }

            // Filter by academic year
            if (academicYearId) {
                query += ' AND sp.academic_year_id = ?';
                params.push(academicYearId);
            }

            // Add sorting
            query += ` ORDER BY ${sortBy} ${sortOrder}`;

            // Add pagination
            query += ' LIMIT ? OFFSET ?';
            params.push(limit, offset);

            // Execute query
            const [students] = await connection.execute(query, params);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(*) as total 
                FROM users u
                JOIN student_profiles sp ON u.id = sp.user_id
                WHERE u.role = 'student'
                ${search ? `AND (
                    u.email LIKE ? OR 
                    u.username LIKE ? OR 
                    sp.student_id_number LIKE ?
                )` : ''}
                ${academicYearId ? 'AND sp.academic_year_id = ?' : ''}
            `;

            const countParams = [];
            if (search) {
                const searchTerm = `%${search}%`;
                countParams.push(searchTerm, searchTerm, searchTerm);
            }
            if (academicYearId) {
                countParams.push(academicYearId);
            }

            const [totalResult] = await connection.execute(countQuery, countParams);
            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                data: students,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                }
            };
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async update(id , data ){
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        
           await connection.execute(
            'UPDATE users SET email = ?, username = ?, password = ?, role = ?, status = ?, last_login = ?, approved_by = ?, approved_at = ?, created_at = ?, updated_at = ? WHERE id = ?',
            [data.email, data.username, data.password, data.role, data.status, data.last_login, data.approved_by, data.approved_at, data.created_at, data.updated_at, id];
            await connection.execute(
              'UPDATE user_profiles SET first_name = ?, last_name = ?, gender = ?, birthdate = ?, phone = ?, address = ?, profile_image = ?, telegram_id = ? WHERE user_id = ?',
              [data.first_name, data.last_name, data.gender, data.birthdate, data.phone, data.address, data.profile_image, data.telegram_id, id]
            );
            await connection.execute(
              'UPDATE student_profiles SET student_id_number = ?, academic_year_id = ?, parent_contact = ?, emergency_contact = ? WHERE user_id = ?',
              [data.student_id_number, data.academic_year_id, data.parent_contact, data.emergency_contact, id]
            );                                                                                                                                                                                                                                                                                                                                                                                
        );
        await connection.commit();
        if(result.affectedRows > 0){
          return {
            result: true,
            message: "Student updated successfully"
          };
        }
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }

    async delete(id){
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        await connection.execute('DELETE FROM student_profiles WHERE user_id = ?', [id]);
        await connection.execute('DELETE FROM user_profiles WHERE user_id = ?', [id]);
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);
        await connection.commit();
        return {
          result: true,
          message: "Student deleted successfully"
        };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    }
}

module.exports = new StudentModel();