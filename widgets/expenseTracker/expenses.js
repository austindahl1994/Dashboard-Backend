import pool from "../../db/mysqlPool.js";

export const getExpenses = async (user_id) => {
  console.log(`Called get expenses`)
  return {dbResponse: "Expenses called"}
	const query = 'SELECT * FROM expenses WHERE user_id = ?' 
	try {
	  const [rows] = pool.execute(query[user_id])
	  return rows
  } catch (error) {
	  throw error
  }
}

export const updateExpense = async (user_id, month, year, data) => {
  const query = 'REPLACE INTO expenses (user_id, month, year, data) VALUES (?, ?, ?, ?)'
  try {
    const response = await pool.execute(query, [user_id, month, year, data])
    return response
  } catch (error) {
    throw new Error("Could not update expense data in database")
  }
}

export const deleteExpense = async (user_id, month, year) => {
  const query = "DELETE FROM expenses WHERE month=? AND year=? AND user_id=?";
  try {
    const [result] = await pool.execute(query, [month, year, user_id]);
    return result;
  } catch (error) {
    console.error(`Database error: ${error}`);
    throw error;
  }
}

//INSERT ON DUPLICATE KEY for updating data, but since not UNIQUE or PK, using REPLACE INTO
