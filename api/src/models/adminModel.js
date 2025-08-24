const db = require('../config/db');
const bcrypt = require('bcrypt');

class AdminModel {

  async create(data) {
    const connection = await db.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      await connection.beginTransaction();
      const [userResult] = await connection.execute(
        'INSERT INTO users (email , password, role, status, last_login, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          data.email,
          hashedPassword,
          'admin',
          'active',
          null,
          new Date(),
          null,
        ]
      );

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

      await connection.execute(
        'INSERT INTO admin_profiles (user_id , admin_level, responsibilities) VALUES (?,  ?, ?)',
        [
          userResult.insertId,
          data.admin_level,
          data.responsibilities,
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
    admin_level = null,
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

      const validSortColumns = ['u.created_at', 'u.email', 'up.first_name', 'up.last_name', 'ap.admin_level'];
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
              ap.admin_level,
              ap.responsibilities
            FROM users u
            JOIN user_profiles up ON u.id = up.user_id
            JOIN admin_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'admin'
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

      // Add sorting and pagination
      query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
      params.push(Number(limit), Number(offset));

      // Execute main query
      const [students] = await connection.query(query, params);

      // Count query for pagination metadata
      let countQuery = `
            SELECT COUNT(*) AS total
            FROM users u
            JOIN admin_profiles ap ON u.id = ap.user_id
            WHERE u.role = 'admin'
          `;
      const countParams = [];

      if (search) {
        countQuery += ` AND (
              u.email LIKE ? or
              up.first_name LIKE ? or
              up.last_name LIKE ? or
              ap.admin_level LIKE ?
            )`;
        const like = `%${search}%`;
        countParams.push(like, like);
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

  async getById(id) {
    const connection = await db.getConnection();
    try {
      const [result] = await connection.execute(`
        SELECT 
          u.id AS user_id,
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
          up.telegram_id,
          ap.admin_level,
          ap.responsibilities
        FROM users u
        JOIN user_profiles up ON u.id = up.user_id
        JOIN admin_profiles ap ON u.id = ap.user_id
        WHERE u.id = ? AND u.role = 'admin'
      `, [id]);
  
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
      const [adminProfile] = await connection.execute(
        'SELECT user_id FROM admin_profiles WHERE user_id = ?',
        [id]
      );
      if (!adminProfile.length) {
        throw new Error('Invalid admin level ID');
      }

      const [userResult] = await connection.execute(
        'UPDATE users SET email = ?, status = ? , updated_at = ? WHERE id = ?',
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
        'UPDATE admin_profiles SET admin_level = ?, responsibilities = ? WHERE user_id = ?',
        [
          data.admin_level,
          data.responsibilities,
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
      await connection.execute('DELETE FROM admin_profiles WHERE user_id = ?', [id]);
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

  async update(id, data) {
    
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Corrected line
      const [adminProfile] = await connection.execute(
        'SELECT user_id FROM admin_profiles WHERE user_id = ?',
        [id]
      );
      if (!adminProfile.length) {
        throw new Error('Invalid admin level ID');
      }
     
      await connection.execute(
        'UPDATE users SET email = ?, status = ?, updated_at = ? WHERE id = ?',
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
        'UPDATE admin_profiles SET admin_level = ?, responsibilities = ? WHERE user_id = ?',
        [
          data.admin_level,
          data.responsibilities,
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

  async updateImageProfile(id, data ,file) {
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
module.exports = new AdminModel();