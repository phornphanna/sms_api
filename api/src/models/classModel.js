const db = require('../config/db');


class ClassModel {

    async  create(data) {
        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();
      
          // Normalize slot just in case
          const slot = (data.time_slot || '').toLowerCase(); // 'am' | 'pm'
      
          // 1) Basic validation (assuming classes never span midnight)
          //    If you DO allow overnight, handle that separately.
          if (!/^\d{2}:\d{2}:\d{2}$/.test(data.start_time) || !/^\d{2}:\d{2}:\d{2}$/.test(data.end_time)) {
            await connection.rollback();
            return { ok: false, code: 'BAD_TIME_FORMAT', message: 'Time must be HH:MM:SS' };
          }
      
          // Quick check in SQL to enforce end_time > start_time for this record
          const [[{ valid_time }]] = await connection.query(
            `SELECT TIME(? ) < TIME(?) AS valid_time`, 
            [data.start_time, data.end_time]
          );
          if (!valid_time) {
            await connection.rollback();
            return { ok: false, code: 'INVALID_RANGE', message: 'end_time must be greater than start_time' };
          }
      
          // 2) Conflict check in SQL:
          //    Date ranges overlap  <=>  new.start_date <= existing.end_date AND new.end_date >= existing.start_date
          //    Time windows overlap <=>  new.start_time < existing.end_time AND new.end_time > existing.start_time
          const [rows] = await connection.execute(
            `
            SELECT 1
            FROM classes
            WHERE teacher_id = ?
              AND time_slot = ?
              AND start_date <= ?      -- existing starts before new ends
              AND end_date   >= ?      -- existing ends after new starts
              AND ( ? < end_time )     -- time overlap #1
              AND ( ? > start_time )   -- time overlap #2
            LIMIT 1
            `,
            [
              data.teacher_id,
              slot,
              data.end_date,   // compare to existing.start_date
              data.start_date, // compare to existing.end_date
              data.start_time, // newStart < existing.end
              data.end_time,   // newEnd   > existing.start
            ]
          );
      
          if (rows.length) {
            await connection.rollback();
            return { ok: false, code: 'TIME_CONFLICT', message: 'Teacher already has a class in this time range for this slot/date.' };
          }
      
          // 3) Insert
          const [result] = await connection.execute(
            `
            INSERT INTO classes
              (course_id, teacher_id, max_students, current_students, status,
               start_time, end_time, time_slot, start_date, end_date, image_class, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              data.course_id,
              data.teacher_id,
              data.max_students ?? 0,
              data.current_students ?? 0,
              data.status ?? 'open',
              data.start_time,
              data.end_time,
              slot,
              data.start_date,
              data.end_date,
              data.image_class ?? null,
              data.created_by,
              data.created_at,
            ]
          );
      
          await connection.commit();
          return { ok: true, id: result.insertId };
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      }
      
    async getAll(
        {
            search = '',
            timeslot = null,
            status = null,
            start_date = null,
            end_date = null,
            sortBy = 'u.created_at',
            sortOrder = 'DESC',
            page = 1,
            limit = 10,
        } = {}
    ) {
        const connection = await db.getConnection();
        try {
            const offset = (page - 1) * limit;

            const validSortOrders = ['ASC', 'DESC'];
            sortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder : 'DESC';

            const validSortColumns = ['created_at'];
            sortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';

            let query = `select cl.id , 
             cl.teacher_id ,
             cl.course_id,
             cl.max_students,
             cl.current_students,
             cl.status,
             cl.start_time,
             cl.end_time,
             cl.start_date,
             cl.end_date,
             cl.image_class,
             cl.created_by,
             cl.created_at,
             cl.time_slot 
              FROM classes cl 
              JOIN courses co ON cl.course_id = co.id
              JOIN teacher_profiles te ON cl.teacher_id = te.user_id
            `;

            // param filter 
            const params = [];
            if (search) {
                query += ' AND room LIKE ?';
                params.push(`%${search}%`);
            }

            if (timeslot) {
                query += ' AND timeslot = ?';
                params.push(timeslot);
            }

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            if (start_date) {
                query += ' AND start_date = ?';
                params.push(start_date);
            }

            if (end_date) {
                query += ' AND end_date = ?';
                params.push(end_date);
            }


            query += ' ORDER BY ' + sortBy + ' ' + sortOrder;
            query += ' LIMIT ' + limit + ' OFFSET ' + (page - 1) * limit;

            const [result] = await connection.execute(query, params);

            // Count query for pagination metadata
            let countQuery = `
      SELECT COUNT(*) AS total
      FROM classes cl
      JOIN courses co ON cl.course_id = co.id
      JOIN teacher_profiles te ON cl.teacher_id = te.user_id` ;
            const countParams = [];

            if (search) {
                countQuery += ` AND (
        cl.room LIKE ? or
        te.first_name LIKE ? or
        te.last_name LIKE ? or
        co.name LIKE ?
      )`;
                const like = `%${search}%`;
                countParams.push(like, like);
            }

            const [countResult] = await connection.query(countQuery, countParams);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            return {
                data: result,
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
            const [result] = await connection.execute('SELECT * FROM classes WHERE id = ?', [id]);
            connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async  update(id, data) {
        const connection = await db.getConnection();
        try {
          await connection.beginTransaction();
      
          // Normalize slot
          const slot = (data.time_slot || '').toLowerCase();
      
          // Validate time format and order
          const parseTime = (t) => {
            const parts = t.split(':').map(Number);
            return parts.length === 3 ? (parts[0] * 3600 + parts[1] * 60 + parts[2]) : null;
          };
      
          const startSeconds = parseTime(data.start_time);
          const endSeconds = parseTime(data.end_time);
      
          if (startSeconds === null || endSeconds === null) {
            await connection.rollback();
            return { ok: false, code: 'BAD_TIME_FORMAT', message: 'Time must be HH:MM:SS' };
          }
      
          if (endSeconds <= startSeconds) {
            await connection.rollback();
            return { ok: false, code: 'INVALID_RANGE', message: 'end_time must be greater than start_time' };
          }
      
          // Check for schedule conflict (excluding this class ID)
          const [rows] = await connection.execute(
            `
            SELECT 1
            FROM classes
            WHERE teacher_id = ?
              AND time_slot = ?
              AND id <> ?
              AND start_date <= ?
              AND end_date   >= ?
              AND ( ? < end_time )
              AND ( ? > start_time )
            LIMIT 1
            `,
            [
              data.teacher_id,
              slot,
              id,
              data.end_date,   // existing.start_date <= new.end_date
              data.start_date, // existing.end_date >= new.start_date
              data.start_time, // new.start_time < existing.end_time
              data.end_time    // new.end_time > existing.start_time
            ]
          );
      
          if (rows.length) {
            await connection.rollback();
            return { ok: false, code: 'TIME_CONFLICT', message: 'Teacher already has another class in this time range.' };
          }
      
          // Perform update
          await connection.execute(
            `
            UPDATE classes 
            SET course_id = ?, teacher_id = ?, max_students = ?, current_students = ?, status = ?, 
                start_time = ?, end_time = ?, time_slot = ?, start_date = ?, end_date = ?, 
                image_class = ?, updated_by = ?, updated_at = NOW()
            WHERE id = ?
            `,
            [
              data.course_id,
              data.teacher_id,
              data.max_students,
              data.current_students,
              data.status,
              data.start_time,
              data.end_time,
         
              data.start_date,
              data.end_date,
              data.image_class,
              data.updated_by,
              id
            ]
          );
      
          await connection.commit();
          return { ok: true, message: 'Class updated successfully' };
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      }
      

    async delete(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute('DELETE FROM classes WHERE id = ?', [id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async deleteImage(id) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute('UPDATE classes SET image_url = "no-img.jpg" WHERE id = ?', [id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release()
        }
    }

    async updateImage(id, file) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute('UPDATE classes SET image_url = ? WHERE id = ?', [file, id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release()
        }
    }

    async getImageById(id) {
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute('SELECT image_url FROM classes WHERE id = ?', [id]);
            connection.commit();
            return result[0];
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

}
module.exports = new ClassModel();