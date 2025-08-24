const db = require('../config/db');


class CategoryModel {
    
    async create(data){
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                'INSERT INTO categories ( id , name) VALUES (?, ?)',
                [data.id , data.name]
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

    async getById(id){
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute('SELECT * FROM categories WHERE id = ?', [id]);
             connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async update(id, data){
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                'UPDATE categories SET name = ? WHERE id = ?',
                [data.name, id]
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

    async delete(id){
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
            await connection.execute('DELETE FROM categories WHERE id = ?', [id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getAll(){
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute('SELECT * FROM categories ORDER BY id ASC');
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

module.exports = new CategoryModel();
