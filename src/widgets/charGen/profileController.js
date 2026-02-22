import * as profile from "./profile.js";

const profileHome = async (req, res) => {
  ////console.log('profile home called from frontend');
  try {
    return res
      .status(200)
      .json({ message: "Successfully called profiles home" });
  } catch (error) {
    console.error(`There was an error of: ${error}`);
    return res.status(400).json({ message: `Error with database: ${error}` });
  }
};

const saveProfile = async (req, res) => {
  const name = req.params.name;
  const { user_id, properties } = req.body;
  console.log(`Creating profile`);
  console.log(user_id, name, properties);
  try {
    if (!name || name.length === 0 || Object.keys(properties).length === 0) {
      console.log(`No name, or no properties`);
      throw new Error("Need to have name and properties");
    }
    // console.log(`Trying to create profile now`)
    const data = await profile.saveProfile(user_id, name, properties);
    // console.log(data)
    // console.log(`Creation successful`)
    return res.status(201).json({ message: "Successfully saved profile" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error creating profile: ${error}` });
  }
};

const getProfile = async (req, res) => {
  // console.log(`Calling get profile`)
  const { name } = req.params;
  const user_id = req.body.user_id;
  try {
    if (!user_id || !name || name.length === 0) {
      throw new Error("Need to submit a name");
    }
    const data = await profile.getProfile(user_id, name);
    if (data.length === 0) {
      throw new Error("No profile found");
    }
    console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ message: `Error getting profile: ${error}` });
  }
};

const getRecentProfiles = async (req, res) => {
  // console.log(`Calling get recent profiles`)
  const user_id = req.body.user_id;
  try {
    const data = await profile.getRecentProfiles(user_id);
    // console.log(data)
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Could not get recent profiles: ${error}` });
  }
};

const deleteProfile = async (req, res) => {
  const { name } = req.params;
  const user_id = req.body.user_id;
  try {
    if (!name || name.length === 0 || !user_id) {
      throw new Error("Need to submit profile name");
    } else if (!user_id) {
      throw new Error("Need to submit user_id to delete");
    }
    await profile.deleteProfile(user_id, name);
    res.status(200).json({ message: "Successfully deleted profile" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Error deleting the profile: ${error}` });
  }
};

export {
  profileHome,
  saveProfile,
  getProfile,
  getRecentProfiles,
  deleteProfile,
};
