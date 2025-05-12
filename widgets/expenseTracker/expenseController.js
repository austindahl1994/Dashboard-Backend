import * as expenses from "./expenses.js";

export const getExpenses = async (req, res) => {
  const { user_id } = req.body;
  console.log(`Expenses called`)
  try {
    if (!user_id) throw new Error("No user ID passed in");
    const data = await expenses.getExpenses(user_id);
    if (data.length === 0) throw new Error("No data found for user");
    console.log(`Found expenses for user, returning`)
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `Error getting data from database: ${error}` });
  }
};

export const updateExpenses = async (req, res) => {
  //console.log(`Update expense reqest made`);
  const { month, year } = req.params;
  const { user_id, data } = req.body;
  try {
    if (!user_id || !month || !year)
      throw new Error("Not enough information passed in with data");
    const response = await expenses.updateExpense(user_id, month, year, data);
    if (response.affectedRows === 1 || response.affectedRows === 2) {
      return res.status(200).json({
        message: `Successfully updated ${month} of ${year} in database`,
      });
    }
    throw new Error(`Could not update the data for ${month} of ${year}`);
  } catch (error) {
    console.log(`Error updating ${error}`);
    res.status(400).json({ message: "Unable to save data to database" });
  }
};

export const deleteExpenses = async (req, res) => {
  const { month, year } = req.params;
  const { user_id } = req.body;
  try {
    if (!user_id || !month || !year)
      throw new Error("Not enough information passed in!");
    const response = await expenses.deleteExpense(user_id, month, year);
    if (response.affectedRows !== 1)
      throw new Error(`Could not delete the data for ${month} of ${year}`);
    res
      .status(200)
      .json({ message: "Successfully delete month and year from database" });
  } catch (error) {
    res.status(400).json({ message: `Could not delete expenses: ${error}` });
  }
};
