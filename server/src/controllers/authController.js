const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const { signToken } = require('../utils/jwt');

exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1) Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2) Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3) Create user
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // 4) Sign token
    const token = signToken(newUser.id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1) Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2) Check if user exists & password is correct
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // 3) If everything ok, send token to client
    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
};
