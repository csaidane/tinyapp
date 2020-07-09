
//This helper method finds a user for a given email address (Database must be formatted properly)
const findUserByEmail = (email, database) => {
  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;
};


//This method is used to generate shortURLs and new user IDs
const generateRandomString = function() {
  let random = Math.random().toString(36).substring(7);
  return random;
};


//This method returns the subset of the URL database corresponding to the URLs of a given user
const findURLByUser = function(cookieID, database) {
  let output = {};
  for (let short in database) {
    if (database[short]['userID'] === cookieID) {
      output[short] = database[short]['longURL'];
    }
  }
  return output;
};

module.exports = {findUserByEmail, generateRandomString , findURLByUser};