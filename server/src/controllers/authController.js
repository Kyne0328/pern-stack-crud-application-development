const argon2 = require("argon2");
const { pool } = require("../config/database");

function cleanUsername(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function validateCredentials(username, password) {
  if (!username) {
    return "Username is required";
  }

  if (username.length > 50) {
    return "Username must be less than 50 characters";
  }

  if (typeof password !== "string" || password.length < 8) {
    return "Password length must be at least 8 characters";
  }

  return null;
}

async function register(req, res) {
  const username = cleanUsername(req.body.username);
  const password = req.body.password;

  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({
      success: false,
      message: validationError,
    });
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  try {
    const result = await pool.query(
      `INSERT INTO users (
            username, 
            password_hash) 
            VALUES ('$1, $2')
            RETURNING user_id::TEXT AS "userID", 
            username`,
      { username, passwordHash },
    );

    const user = result.rows[0];

    req.session.userID = user.userID;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }
    throw error;
  }
}

async function login(req, res) {
  const username = cleanUsername(req.body.username);
  const password = req.body.password;

  if (!username || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Username and password are required",
    });
  }

  const result = await pool.query(
    `SELECT user_id::TEXT AS "userID",
        username,
        password_hash AS "passwordHash"
        FROM users
        WHERE username = $1`,
    [username],
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password);

  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid username or password",
    });
  }
  
}
