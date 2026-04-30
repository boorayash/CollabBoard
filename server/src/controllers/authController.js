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

    // 3) Create user and default team in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, password: hashedPassword, name },
      });

      const team = await tx.team.create({
        data: { name: 'My Team' },
      });

      await tx.teamMember.create({
        data: {
          userId: user.id,
          teamId: team.id,
          role: 'ADMIN',
          status: 'ACCEPTED',
        },
      });

      // CB-001: auto-create default board + 3 lists for every new user
      await tx.board.create({
        data: {
          name: 'Main Board',
          teamId: team.id,
          lists: {
            create: [
              { name: 'To Do',       rank: 'a' },
              { name: 'In Progress', rank: 'b' },
              { name: 'Done',        rank: 'c' },
            ],
          },
        },
      });

      return { user, teamId: team.id };
    });

    // 4) Sign token
    const token = signToken(result.user.id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: { id: result.user.id, email: result.user.email, name: result.user.name },
        teamId: result.teamId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error signing up', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teams: {
          take: 1,
          select: { teamId: true },
        },
      },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: { id: user.id, email: user.email, name: user.name },
        teamId: user.teams[0]?.teamId || null,
      },
    });
  } catch (err) {
    console.error('[authController.login] Error:', err);
    res.status(500).json({ message: err.message || 'Error logging in', stack: err.stack });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query, exact } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const trimmedQuery = query.trim();
    const isExact = exact === 'true' || exact === true;

    const searchCondition = isExact 
      ? {
          OR: [
            { name: { equals: trimmedQuery, mode: 'insensitive' } },
            { email: { equals: trimmedQuery, mode: 'insensitive' } }
          ]
        }
      : {
          OR: [
            { name: { contains: trimmedQuery, mode: 'insensitive' } },
            { email: { contains: trimmedQuery, mode: 'insensitive' } }
          ]
        };

    const users = await prisma.user.findMany({
      where: {
        ...searchCondition,
        NOT: {
          id: req.user.id // Exclude the current user from search
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 10 // Limit results
    });

    res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error searching users', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, password } = req.body;
    const userId = req.user.id;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ message: 'No data provided to update' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: { id: true, name: true, email: true },
    });

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile', error: err.message });
  }
};
