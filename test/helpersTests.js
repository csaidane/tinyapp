const { assert } = require('chai');

const { findUserByEmail } = require('../helpers.js');


const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)['id'];
    const expectedOutput = "userRandomID";
    assert.equal(user,expectedOutput);
  });

  it("should return undefined with an invalid email", function() {
    const user = findUserByEmail("thisEmail@wrong.ca", testUsers);
    const expectedOutput = undefined;
    assert.equal(user,expectedOutput);
  });

});