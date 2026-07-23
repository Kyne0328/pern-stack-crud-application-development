const argon2 = require('argon2');
const {env} = require('../config/environment');
const {
  createUser,
  findUserById,
  findUserByUsername,
} = require('./authQueries');

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function register(req, res) {
  const {username, password} = req.authInput;
  const passwordHash = await argon2.hash(password, {type: argon2.argon2id});

  try {
    const result = await createUser(username, passwordHash);
    const user = result.rows[0];

    await regenerateSession(req);
    req.session.userId = user.userId;

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({success: false, message: 'Username already exists.'});
    }
    throw error;
  }
}

async function login(req, res) {
  const {username, password} = req.authInput;
  const result = await findUserByUsername(username);
  const user = result.rows[0];
  const passwordMatches = user
    ? await argon2.verify(user.passwordHash, password)
    : false;

  if (!user || !passwordMatches) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.',
    });
  }

  await regenerateSession(req);
  req.session.userId = user.userId;

  return res.status(200).json({
    success: true,
    message: 'Login successful.',
    user: {userId: user.userId, username: user.username},
  });
}

async function getCurrentUser(req, res) {
  if (!req.session.userId) {
    return res.status(401).json({success: false, message: 'Not logged in.'});
  }

  const result = await findUserById(req.session.userId);
  const user = result.rows[0];

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({success: false, message: 'User no longer exists.'});
  }

  return res.status(200).json({success: true, user});
}

function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie('employee.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.NODE_ENV === 'production',
    });
    return res.status(200).json({success: true, message: 'Logout successful.'});
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
