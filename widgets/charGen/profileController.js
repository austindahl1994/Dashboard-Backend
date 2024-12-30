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
	const { user_id } = req.params
  const { name, properties } = req.body
  try {
    if (!name || name.length === 0 || Object.keys(properties).length === 0) {
      throw new Error("Need to have name and properties");
    }
    const existing = await profile.getProfile(user_id, name)
    if (existing) {
      throw new Error("There exists a profile with that name already")
    }
    const data = await profile.createProfile(user_id, name, properties);
    if (data.affectedRows !== 1) {
      throw new Error("Profile was not created")
    }
    return res.status(201).json({ message: "Successfully created profile", id: data.insertId });
  } catch (error) {
    return res.status(500).json({ message: `Error creating profile: ${error}` });
  }
};

const getProfile = async (req, res) => {
  const { user_id, name } = req.params
  try {
		if (!name || name.length === 0) {
	  	throw new Error("Need to submit a name");
	  }
    const data = await profile.getProfile(user_id, name);
    if (data.length === 0) {
      throw new Error("No profile found");
    }
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(404)
      .json({ message: `Error getting profile: ${error}` });
  }
};

const getRecentProfiles = async (req, res) => {
  const {user_id, amount} = req.params
  const DEFAULT_AMOUNT = 3
  try {
    const data = await profile.getRecentProfiles(user_id, (amount || DEFAULT_AMOUNT));
    return res.status(200).json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Could not get recent profiles: ${error}` });
  }
};

//TODO: Need to change from current unique name
const updateProfile = async (req, res) => {
  const {user_id, name, properties} = req.params
  try {
      if (!name || name.length === 0 || Object.keys(properties).length === 0) {
        throw new Error("Need to have name and properties");
      }
      const data = await profile.updateProfile(name, properties);
      if (data !== 1) {
        throw new Error("No profile was updated")
      }
    	return res.status(200).json({ message: "Successfully updated profile" });
  } catch (error) {
    return res.status(500).json({message: `Could not update profile: ${error}`})
  }
};

const deleteProfile = async (req, res) => {
  const {user_id, name} = req.params
  try {
    if (!name || !name.length === 0) {
      throw new Error("Need to submit profile name")
    } else if (!user_id) {
      throw new Error("Need to submit user_id to delete")
    }
    const response = await profile.deleteProfile(user_id, name)
    if (response !== 1) {
      throw new Error("Profile did not exist and was not deleted")
    }
  } catch (error) {
    return res.status(500).json({message: `Error deleting the profile: ${error}`})
  }
}

export { profileHome, createProfile, getProfile, getRecentProfiles, updateProfile, deleteProfile };
