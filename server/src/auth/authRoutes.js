const {Router} = require('express');
const {
  getCurrentUser,
  login,
  logout,
  register,
} = require('./authController');
const {validateCredentials} = require('./authValidation');

const router = Router();

router.post('/register', validateCredentials, register);
router.post('/login', validateCredentials, login);
router.get('/current', getCurrentUser);
router.post('/logout', logout);

module.exports = router;
