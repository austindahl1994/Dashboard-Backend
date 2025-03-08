import * as profile from "../widgets/charGen/profile.js";

const testModel = async () => {
  //console.log('Attempting to test profile model')
  try {
    const response = await profile.getProfile("Austin", true);
    //console.log(Object.entries(response));
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

testModel();
