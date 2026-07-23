const {pool} = require('../config/database');

function createUser(username, passwordHash) {
  return pool.query(
    `INSERT INTO users (username, password_hash)
     VALUES ($1, $2)
     RETURNING user_id::TEXT AS "userId", username`,
    [username, passwordHash],
  );
}

function findUserByUsername(username) {
  return pool.query(
    `SELECT
       user_id::TEXT AS "userId",
       username,
       password_hash AS "passwordHash"
     FROM users
     WHERE username = $1`,
    [username],
  );
}

function findUserById(userId) {
  return pool.query(
    `SELECT
       user_id::TEXT AS "userId",
       username
     FROM users
     WHERE user_id = $1`,
    [userId],
  );
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
};
