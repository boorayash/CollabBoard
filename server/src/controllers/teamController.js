const prisma = require('../utils/prisma');

exports.createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    const team = await prisma.team.create({
      data: {
        name,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: { team },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating team', error: err.message });
  }
};

exports.getTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: req.user.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    res.status(200).json({
      status: 'success',
      results: teams.length,
      data: { teams },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching teams', error: err.message });
  }
};
