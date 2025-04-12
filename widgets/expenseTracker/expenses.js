//get all expenses from db, small enough data, let frontend filter/use what it wants
// export const getExpenses = (user_id) => {
// 	const query = 'SELECT * FROM expenses WHERE user_id = ?' 
// 	try {
// 	const [rows] = pool.execute(query[user_id])
// 	return rows
// } catch (error) {
// 	throw error
// }
// }

//INSERT ON DUPLICATE KEY for updating data
