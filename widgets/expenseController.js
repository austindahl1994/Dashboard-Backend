// import * as expenses from './expenses.js'
// export const getExpenses = async (req, res) => {
// 	const { user_id } = req.body
// 	try {
// 	if (!user_id) throw new Error('No user ID passed in')
// 	const data= await expenses.getExpenses(user_id)
// 	if (data.length === 0) throw new Error('No data found for user')
// 	return res.status(200).json(data)
// } catch (error) {
// return res.status(400).json({message: `Error getting data from database: ${error}`})
// }
// }
