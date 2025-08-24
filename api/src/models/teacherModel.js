const db = require('../config/db');
const bcrypt = require('bcrypt');

class TeacherModel {

    async create(data) {
        const connection = await db.getConnection();
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            await connection.beginTransaction();
            const [userResult] =  await connection.execute(
                `INSERT INTO users (email, password, role, status, last_login, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  data.email,
                  hashedPassword,
                  'teacher',
                  'active',
                  null,
                  data.created_at,
                  data.updated_at
                ]
              );
              
              await connection.execute(
                `INSERT INTO user_profiles (user_id, first_name, last_name, gender, birthdate, phone, address, telegram_id, profile_image)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  userResult.insertId,
                  data.first_name,
                  data.last_name,
                  data.gender,
                  data.birthdate,
                  data.phone,
                  data.address,
                  data.telegram_id,
                  'no-img.jpg'
                ]
              );
              

              await connection.execute(
                `INSERT INTO teacher_profiles 
                 (user_id, position_id, experience_years, specialization, bio, office_location, office_hours)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                  userResult.insertId,
                  data.position_id,
                  data.experience_years,
                  data.specialization,
                  data.bio,
                  data.office_location,
                  data.office_hours
                ]
              );
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAll({
        search = '',
        sortBy = 'u.created_at',
        sortOrder = 'DESC',
        page = 1,
        limit = 10,
        experience_years = null,
        position_id = null
    } = {}) {
        const connection = await db.getConnection();
        try {
            const offset = (page - 1) * limit;
            const params = [];

            // Validate and sanitize sort inputs
            const validSortOrders = ['ASC', 'DESC'];
            sortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';

            const validSortColumns = ['u.created_at', 'u.email', 'up.first_name', 'up.last_name', 'tp.experience_years', 'tp.position_id'];
            sortBy = validSortColumns.includes(sortBy) ? sortBy : 'u.created_at';

            // Base query
            let query = `
            SELECT 
              u.id,
              u.email,
              u.status,
              u.created_at,
              up.first_name,
              up.last_name,
              up.phone,
              up.address,
              up.profile_image,
              up.telegram_id,
              tp.position_id,
              tp.experience_years,
              tp.specialization,
              tp.bio,
              tp.office_location,
              tp.office_hours
            FROM users u
                JOIN user_profiles up ON u.id = up.user_id
                JOIN teacher_profiles tp ON u.id = tp.user_id
            WHERE u.role = 'teacher'
          `;
            // Search filters
            if (search) {
                query += ` AND (
              u.email LIKE ? OR 
              up.first_name LIKE ? OR 
              up.last_name LIKE ? OR 
              ap.department LIKE ?
            )`;
                const like = `%${search}%`;
                params.push(like, like, like, like);
            }
            if (experience_years) {
                query += ` AND tp.experience_years= ?`;
                params.push(experience_years);
            }
            if (position_id) {
                query += ` AND tp.position_id = ?`;
                params.push(position_id);
            }
            // Add sorting and pagination
            query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
            params.push(Number(limit), Number(offset));
            // Execute main query
            const [teachers] = await connection.query(query, params);
            // Count query for pagination metadata
            let countQuery = `
            SELECT COUNT(*) AS total
            FROM users u
            JOIN teacher_profiles tp ON u.id = tp.user_id
            WHERE u.role = 'teacher'
          `;
            const countParams = [];

            if (search) {
                countQuery += ` AND (
              u.email LIKE ? or
              up.first_name LIKE ? or
              up.last_name LIKE ? or
              tp.experience_years LIKE ?
            )`;
                const like = `%${search}%`;
                countParams.push(like, like);
            }

            const [countResult] = await connection.query(countQuery, countParams);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);
            return {
                data: teachers,
                pagination: {
                    total,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            };
        } catch (error) {
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
              u.id,
              u.email,
              u.status,
              u.created_at,
              up.first_name,
              up.last_name,
              up.phone,
              up.address,
              up.profile_image,
              up.telegram_id,
              tp.position_id,
              tp.experience_years,
              tp.specialization,
              tp.bio,
              tp.office_location,
              tp.office_hours
            FROM users u
            JOIN user_profiles up ON u.id = up.user_id
            JOIN teacher_profiles tp ON u.id = tp.user_id
            WHERE u.role = 'teacher' AND u.id = ?
      `, [id]);
            connection.commit()
            return result;
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async update(id, data) {

        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            await connection.execute(
                'UPDATE users SET email = ? , status = ? , updated_at = ? WHERE id = ?',
                [
                    data.email,
                    data.status,
                    data.updated_at || new Date(),
                    id,
                ]
            );       

            await connection.execute(
                'UPDATE user_profiles SET first_name = ?, last_name = ?, gender = ?, birthdate = ?, phone = ?, address = ?, telegram_id = ? WHERE user_id = ?',
                [
                    data.first_name,
                    data.last_name,
                    data.gender,
                    data.birthdate,
                    data.phone,
                    data.address,
                    data.telegram_id,
                    id,
                ]
            );

            await connection.execute(
                'UPDATE teacher_profiles SET position_id = ?, experience_years = ?, specialization = ?, bio = ?, office_location = ?, office_hours = ? WHERE user_id = ?',
                [
                    data.position_id,
                    data.experience_years,
                    data.specialization,
                    data.bio,
                    data.office_location,
                    data.office_hours,
                    id,
                ]
            );
            await connection.commit();

            return true;
        } catch (error) {
            await connection.rollback();
            throw new Error(error.message);
        } finally {
            connection.release();
        }
    }

    async delete(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute('DELETE FROM teacher_profiles WHERE user_id = ?', [id]);
            await connection.execute('DELETE FROM user_profiles WHERE user_id = ?', [id]);
            await connection.execute('DELETE FROM users WHERE id = ?', [id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteProfileImage(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute('update user_profiles set profile_image = "no-img.jpg" WHERE user_id = ?', [id]);
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getImageById(id) {
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute('SELECT profile_image FROM user_profiles WHERE user_id = ?', [id]);
            return result[0];
        } catch (error) {
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateImageProfile(id, file) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute(
                'UPDATE user_profiles SET profile_image = ? WHERE user_id = ?',
                [file, id]
            );
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}
module.exports = new TeacherModel();