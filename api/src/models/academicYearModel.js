const db = require('../config/db');

class AcademicYearModel {
    async create(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                'INSERT INTO academic_years ( id , name) VALUES (?, ?)',
                [data.id , data.name]
            );
            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAll() {
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute('SELECT * FROM academic_years ORDER BY id ASC');
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
        const [result] = await connection.execute(
            'UPDATE academic_years SET name = ? WHERE id = ?',
            [data.name, id]
        );
        await connection.commit();
        return result;
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
        await connection.execute('DELETE FROM academic_years WHERE id = ?', [id]);
        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

async getById(id){
    const connection = await db.getConnection();
    try {
        const [result] = await connection.execute('SELECT * FROM academic_years WHERE id = ?', [id]);
        connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

}

module.exports = new AcademicYearModel();