const db = require('../config/db');

class CourseModel {
 
    async create(data){
        const connection = await db.getConnection();
         try {
            await connection.beginTransaction();
            const [result] = await connection.execute(
                'INSERT INTO courses ( id ,name, category_id,description, price , duration_weeks , delivery_type ,  image_url , created_by , created_at) VALUES (?, ?, ?, ?, ?, ?, ? , ? , ? , ?)',
                [data.id,data.name, data.category_id, data.description, data.price, data.duration_weeks , data.delivery_type  , data.image_url , data.created_by , data.created_at]
            );
            await connection.commit();
            return  true;
         } catch (error) {
            await connection.rollback();
            throw error;
         }finally {
            connection.release();
         }
    }

    async getAll(){
        const connection = await db.getConnection();
        try {
            const [result] = await connection.execute('SELECT * FROM courses ORDER BY id ASC');
             connection.commit();
            return result;
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
            const [result] = await connection.execute('SELECT * FROM courses WHERE id = ?', [id]);
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
            await connection.execute(
                'UPDATE courses SET name = ? , category_id = ?  , description = ? , price = ? , duration_weeks = ? , delivery_type = ? WHERE id = ?',
                [data.name, data.category_id, data.description, data.price, data.duration_weeks, data.delivery_type, id]
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
            await connection.execute('DELETE FROM courses WHERE id = ?', [id]);
            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getImageById(id){
          const connection = await db.getConnection();
          try{
             const [result] = await connection.execute('SELECT image_url FROM courses WHERE id = ?', [id]);
             connection.commit();
             return result[0];
          }catch(error){
            await connection.rollback();
            throw error;
          }finally{
            connection.release();
          }
    }

    async updateImage (id , file){
          const connection =  await db.getConnection();
          try {
             const [result] = await connection.execute(
                'UPDATE courses SET image_url = ? WHERE id = ?',
                [file, id]
             );
             await connection.commit();
             return true;
          }catch(error){
             await connection.rollback();
             throw error;
          }finally{ 
            connection.release()
          }
    }
    
    async deleteImage (id) {
          const  connection = await  db.getConnection();
          try {
            await connection.beginTransaction();
             const [result] = await connection.execute('UPDATE courses SET image_url = "no-img.jpg" WHERE id = ?', [id]);
             await connection.commit();
             return true;
          }catch(error){
             await connection.rollback();
             throw error;
          }finally{ 
            connection.release()
          }
    }

}
module.exports = new  CourseModel();