const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ msg: 'Usuario no existe' });

  const valid = bcrypt.compareSync(req.body.password, user.password);
  if (!valid) return res.status(401).json({ msg: 'Credenciales inválidas' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
};
