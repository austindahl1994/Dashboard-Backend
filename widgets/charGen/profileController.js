import profile from "./profile";

const createProfile = async () => {

}

const getProfile = async (req, res) => {
    const name = req.params.name
    if (!name || name.length === 0) {
        return res.status(400).json({message: 'Error, name needs to have a value'})
    }
    try {
        const data = await profile.getProfile(name)
        if (data.length === 0) {
            return res.status(404).json({message: 'Error, no profile found'})
        }
        return res.status(200).json(data)
    } catch (error) {
        console.error(`Error: ${error}`)
        return res.status(500).json({message: `Internal server error with database`})
    }
}

const foo = async (props) => {
    const query = 'INSERT INTO table_name (column1, column2...) VALUES (?, ?, ?, ?)'
    try {
        const result = await pool.execute(query, [props]) //JSON.stringify() check
        return result; //affectedRows (typically 1 if successful), insertId
    } catch (error) {
        console.error(`Database error: ${error}`)
        throw e
    }
}

export { getProfile }