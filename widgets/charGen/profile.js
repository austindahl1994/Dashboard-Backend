import pool from '../../db/mysqlPool.js'

const createProfile = async (user_id=1, name, data) => {
    console.log(`Attempting to create profile with name: ${name}`)
    const query = 'INSERT INTO profiles (name, properties) VALUES(?, ?) WHERE user_id=?'
    try {
        const result = pool.execute(query, [user_id, name, JSON.stringify(data)])
        return result.affectedRows;
    } catch (error) {
        throw e
    }
}

//change user_id after initial tests are done
const getProfile = async (user_id=1, name) => {
    const query = 'SELECT * FROM profiles WHERE name=? AND user_id=?'
    try {
        const [rows] = await pool.execute(query, [name, user_id])
        return rows[0]
    } catch (error) {
        console.log(`There was an error: ${error}`)
        throw error
    }
}

const getRecentProfiles = async (user_id=1, amount) => {
    const query = 'SELECT * FROM profiles WHERE user_id=? ORDER BY time_updated DESC LIMIT ?'
    try {
        const rows = await pool.execute(query, [user_id, amount])
        return rows
    } catch (error) {
        console.error(`There was an error getting the rows: ${error}`)
        throw e
    }
}

const updateProfile = async (user_id=1, name, properties) => {
    const query = 'UPDATE profiles SET properties=? WHERE name=? AND user_id=?'
    try {
        const result = await pool.execute(query, [
          JSON.stringify(properties),
          name,
        	user_id
        ]);
        return result.affectedRows //affectedRows
    } catch (error) {
        console.error(`Database error: ${error}`)
        throw e
    }
}

const deleteProfile = async (user_id=1, name) => {
    const query = 'DELETE FROM profiles WHERE name=? AND user_id=?'
    try {
        const result = await pool.execute(profiles, [name, user_id])
        return result.affectedRows
    } catch (error) {
        console.error(`Database error: ${error}`)
        throw e
    }
}

export { createProfile, getProfile, getRecentProfiles, updateProfile, deleteProfile }
