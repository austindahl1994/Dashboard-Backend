let cachedData = null;
let lastCacheTime = Date.now();
//TODO: Get the rest of this up and running, on server start, can check via discord bot etc
const tryForCached = () => {
  const now = Date.now();

  if (!cachedData) {
    console.log(`Need to get data from database`);
  } else {
    console.log(`Data was cached ${lastCacheTime - now} time ago`);
    console.log(`Will display cached data`);
  }
};

export const getCachedData = async () => {
  if (cachedData) {
    return cachedData;
  } else {
    //Call for DB data here
  }
};

export const updateCachedData = (data) => {};
