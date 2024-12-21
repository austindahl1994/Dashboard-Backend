import pool from '../../db/mysqlPool.js'

const createProfile = async (name, data) => {
    console.log(`Attempting to create profile with name: ${name}`)
    const query = 'INSERT INTO profiles (name, properties) VALUES(?, ?)'
    try {
        const result = pool.execute(query, [name, JSON.stringify(data)])
        return result.affectedRows;
    } catch (error) {
        throw e
    }
    
}

const getProfile = async (name) => {
    console.log(`Attempting to query profiles for name: ${name}`)
    const query = 'SELECT * FROM profiles WHERE name=?'
    try {
        const [rows] = await pool.execute(query, [name])
        return rows[0]
    } catch (error) {
        console.log(`There was an error: ${error}`)
        throw error
    }
}

const getRecentProfiles = async (amount) => {
    try {
        const data = await fromwhere
    } catch (error) {
        console.error(`There was an error: ${error}`)
        throw e
    }
}

const updateProfile = async (name, properties) => {
    const query = 'UPDATE profiles SET properties=? WHERE name=?'
    try {
        const result = await pool.execute(query, [
          JSON.stringify(properties),
          name,
        ]);
        return result.affectedRows //affectedRows
    } catch (error) {
        console.error(`Database error: ${error}`)
        throw e
    }
}

const deleteProfile = async (name) => {
    const query = 'DELETE FROM profiles WHERE name=?'
    try {
        const result = await pool.execute(profiles, [name])
        return result.affectedRows
    } catch (error) {
        console.error(`Database error: ${error}`)
        throw e
    }
}

export { createProfile, getProfile, getRecentProfiles, updateProfile, deleteProfile }