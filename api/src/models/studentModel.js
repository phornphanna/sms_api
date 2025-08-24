const db = require('../config/db');
const bcrypt = require('bcrypt');

class StudentModel {
  async create(data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Validate academic_year_id if provided
      if (data.academic_year_id) {
        const [academicYear] = await connection.execute('SELECT id FROM academic_years WHERE id = ?', [data.academic_year_id]);
        if (!academicYear.length) {

          throw new Error('Invalid academic year ID');
        }
      }

      // Default file handling
      const hashedPassword = await bcrypt.hash(data.password, 10);
      // Insert into users
      const [userResult] = await connection.execute(
        'INSERT INTO users (email , password, role, status, last_login, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          data.email,
          hashedPassword,
          data.role || 'student',
          data.status || 'active',
          data.last_login || null,
          data.created_at || new Date(),
          data.updated_at || null,
        ]
      );

      // Insert user profile
      await connection.execute(
        'INSERT INTO user_profiles (user_id, first_name, last_name, gender, birthdate, phone, address, profile_image, telegram_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          userResult.insertId,
          data.first_name,
          data.last_name,
          data.gender || null,
          data.birthdate || null,
          data.phone || null,
          data.address || null,
          'no-img.jpg',
          data.telegram_id || null,
        ]
      );

      // Insert student profile
      let student_id_number = userResult.insertId;
      if (student_id_number.length == 1) {
        student_id_number = 'STUDENT' + '00' + student_id_number;
      } else if (student_id_number.length == 2) {
        student_id_number = 'STUDENT' + '0' + student_id_number;
      } else {
        student_id_number = 'STUDENT' + student_id_number;
      }
      await connection.execute(
        'INSERT INTO student_profiles (user_id, student_id_number, academic_year_id, parent_contact, emergency_contact) VALUES (?, ?, ?, ?, ?)',
        [
          userResult.insertId,
          student_id_number,
          data.academic_year_id,
          data.parent_contact,
          data.emergency_contact,
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

  async getById(id) {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(
        `
        SELECT 
          u.id,
          u.email,
          u.status,
          u.created_at,
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
      `,
        [id]
      );
      return result[0];
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
    limit = 10,
  } = {}) {
    const connection = await db.getConnection();
    try {
      const offset = (page - 1) * limit;
      const params = [];

      // Validate and sanitize sort inputs
      const validSortOrders = ['ASC', 'DESC'];
      sortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';

      const validSortColumns = ['u.created_at', 'u.email', 'up.first_name', 'up.last_name', 'sp.student_id_number'];
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
          sp.student_id_number,
          up.profile_image,
          sp.parent_contact,
          sp.emergency_contact,
          sp.academic_year_id,
          ay.name AS academic_year_name
        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        JOIN student_profiles sp ON u.id = sp.user_id
        LEFT JOIN academic_years ay ON sp.academic_year_id = ay.id
        WHERE u.role = 'student'
      `;

      // Search filters
      if (search) {
        query += ` AND (
          u.email LIKE ? OR 
          up.first_name LIKE ? OR 
          up.last_name LIKE ? OR 
          sp.student_id_number LIKE ?
        )`;
        const like = `%${search}%`;
        params.push(like, like, like, like);
      }

      // Academic year filter
      if (academicYearId) {
        query += ` AND sp.academic_year_id = ?`;
        params.push(academicYearId);
      }

      // Add sorting and pagination
      query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      // Execute main query
      const [students] = await connection.query(query, params);

      // Count query for pagination metadata
      let countQuery = `
        SELECT COUNT(*) AS total
        FROM users u
        JOIN student_profiles sp ON u.id = sp.user_id
        WHERE u.role = 'student'
      `;
      const countParams = [];

      if (search) {
        countQuery += ` AND (
          u.email LIKE ? OR 
          sp.student_id_number LIKE ?
        )`;
        const like = `%${search}%`;
        countParams.push(like, like);
      }

      if (academicYearId) {
        countQuery += ` AND sp.academic_year_id = ?`;
        countParams.push(academicYearId);
      }

      const [countResult] = await connection.query(countQuery, countParams);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return {
        data: students,
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

  async update(id, data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [academicYear] = await connection.execute(
        'SELECT id FROM academic_years WHERE id = ?',
        [data.academic_year_id]
      );
      if (!academicYear.length) {
        throw new Error('Invalid academic year ID');
      }

      const [userResult] = await connection.execute(
        'UPDATE users SET email = ?, role = ?, status = ? , updated_at = ? WHERE id = ?',
        [
          data.email,
          data.role,
          data.status,
          new Date(),
          id,
        ]
      );

      await connection.execute(
        'UPDATE user_profiles SET first_name = ?, last_name = ?, gender = ?, birthdate = ?, phone = ?, address = ? , telegram_id = ? WHERE user_id = ?',
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
        'UPDATE student_profiles SET academic_year_id = ?, parent_contact = ?, emergency_contact = ? WHERE user_id = ?',
        [
          data.academic_year_id,
          data.parent_contact,
          data.emergency_contact,
          id,
        ]
      );

      await connection.commit();
      return userResult;
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
      await connection.execute('DELETE FROM student_profiles WHERE user_id = ?', [id]);
      await connection.execute('DELETE FROM user_profiles WHERE user_id = ?', [id]);
      const [result] = await connection.execute('DELETE FROM users WHERE id = ?', [id]);
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
      const [result] = await connection.execute(
        'SELECT profile_image FROM user_profiles WHERE user_id = ?',
        [id]
      );
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
}

module.exports = new StudentModel();