import * as profile from "./profile.js";

const profileHome = async (req, res) => {
  //console.log('profile home called from frontend');
  try {
    return res.status(200).json({ message: 'Successfully called profiles home'});
  } catch (error) {
    console.error(`There was an error of: ${error}`);
    return res.status(400).message(`Error with database: ${error}`);
  }
};

const createProfile = async (req, res) => {
  const name = req.body.name
  const properties = req.body.properties
  if (!name || name.length === 0 || Object.keys(properties).length === 0) {
    return res
      .status(400)
      .json({ message: "Need to have name and properties" });
  }
  try {
    const data = await profile.createProfile(name, properties);
    if (data === 1) {
      res.status(201).json({ message: "Successfully created profile" });
    } else {
      res.status(400).json({ message: "Error creating profile" });
    }
  } catch (error) {
    console.error(`There was an error of: ${error}`);
    throw e;
  }
};

const getProfile = async (req, res) => {
  const { name, id } = req.params
  
  if (!name || name.length === 0) {
    console.log(`Nothing passed in!`)
    return res
      .status(400)
      .json({ message: "Error, name needs to have a value" });
  }
  try {
    const data = await profile.getProfile(name, id);
    if (data.length === 0) {
      return res.status(404).json({ message: "Error, no profile found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error: ${error}`);
    return res
      .status(500)
      .json({ message: `Internal server error with database` });
  }
};

const getRecentProfiles = async (req, res) => {
  const amount = req.params.amount
  const DEFAULT_AMOUNT = 3
  try {
    const data = await profile.getRecentProfiles(amount || DEFAULT_AMOUNT);
    return res.status(200).json({ data });
  } catch (error) {
    console.error(`There was an error of: ${error}`);
    res
      .status(400)
      .json({ message: "There was an error getting the profiles" });
  }
};

const updateProfile = async (name, properties) => {
  try {
    const data = await profile.updateProfile(name, properties);
    if (data.affectedRows === 1) {
        return res.status(200).json({ message: "Successfully updated the profile" });
    } else {
        return res.status(400).json({message: 'Error updating profile'})
    }
  } catch (error) {
    console.error(`There was an error of: ${error}`);
    return res.status(400).json({message: 'Server error updating the profile'})
  }
};

export { profileHome, createProfile, getProfile, getRecentProfiles, updateProfile };
