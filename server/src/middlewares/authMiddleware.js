const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

exports.protect = async (req, res, next) => {
  try {
    // 1) Getting token and check if it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in! Please log in to get access.' });
    }

    // 2) Verification token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
  } catch (err) {
    console.error(`[req:${req.id || 'no-id'}][protect] Error:`, err.message);
    res.status(401).json({ message: 'Invalid token or session expired', error: err.message });
  }
};

/**
 * Middleware to authorize users based on their role in a specific team.
 * 
 * Deterministic Resolution Flow (cascade):
 *   1. teamId (direct from params/body/query)
 *   2. boardId -> resolve teamId
 *   3. listId  -> resolve teamId (list -> board -> team)
 *   4. cardId  -> resolve teamId (card -> list -> board -> team)
 * 
 * Each step is logged with correlation ID for full traceability.
 * 
 * @param {...string} allowedRoles - Roles allowed ('ADMIN', 'MEMBER'). 
 *   If empty, any team member is allowed.
 */
exports.authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const reqId = req.id || 'no-id';

    try {
      // 0) Guard: req.user must exist (protect must run first)
      if (!req.user?.id) {
        console.error(`[req:${reqId}][auth] FAIL: req.user is undefined — protect middleware may not have run`);
        return res.status(401).json({ message: 'Authentication required before authorization' });
      }

      // 1) Deterministic Resolution — find teamId via cascade
      let teamId = null;
      let resolutionPath = '';

      // Step 1: Direct teamId
      teamId = req.params?.teamId || req.body?.teamId || req.query?.teamId;
      if (teamId) {
        resolutionPath = 'direct:teamId';
      }

      // Step 2: boardId -> resolve teamId
      if (!teamId) {
        const boardId = req.params?.boardId || req.body?.boardId || req.query?.boardId;
        if (boardId) {
          const board = await prisma.board.findUnique({
            where: { id: boardId },
            select: { teamId: true },
          });
          if (board?.teamId) {
            teamId = board.teamId;
            resolutionPath = `boardId:${boardId}→teamId`;
          }
        }
      }

      // Step 3: listId -> board -> team
      if (!teamId) {
        const listId = req.params?.listId || req.body?.listId || req.query?.listId;
        if (listId) {
          const list = await prisma.list.findUnique({
            where: { id: listId },
            include: { board: { select: { teamId: true } } },
          });
          if (list?.board?.teamId) {
            teamId = list.board.teamId;
            resolutionPath = `listId:${listId}→boardId→teamId`;
          }
        }
      }

      // Step 4: cardId -> list -> board -> team
      if (!teamId) {
        const cardId = req.params?.cardId || req.body?.cardId || req.query?.cardId;
        if (cardId) {
          const card = await prisma.card.findUnique({
            where: { id: cardId },
            include: { list: { include: { board: { select: { teamId: true } } } } },
          });
          if (card?.list?.board?.teamId) {
            teamId = card.list.board.teamId;
            resolutionPath = `cardId:${cardId}→listId→boardId→teamId`;
          }
        }
      }

      // FAIL-FAST: If we still have no teamId, return 400 immediately
      if (!teamId) {
        console.error(`[req:${reqId}][auth] FAIL: Unable to resolve team context from request`);
        console.error(`[req:${reqId}][auth] params:`, req.params, 'body keys:', Object.keys(req.body || {}), 'query:', req.query);
        return res.status(400).json({
          message: 'Unable to resolve team context. Provide teamId, boardId, listId, or cardId.',
          reqId,
        });
      }

      // 2) Verify membership in the resolved team (DB is source of truth)
      const membership = await prisma.teamMember.findUnique({
        where: {
          userId_teamId: {
            userId: req.user.id,
            teamId,
          },
        },
      });

      if (!membership) {
        console.warn(`[req:${reqId}][auth] DENY: User ${req.user.id} is not a member of team ${teamId}`);
        return res.status(403).json({ message: 'You do not belong to this team' });
      }

      // 3) Role check (if specific roles are required)
      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        console.warn(`[req:${reqId}][auth] DENY: User role=${membership.role}, required=[${allowedRoles}]`);
        return res.status(403).json({
          message: `Access denied. This action requires one of: [${allowedRoles.join(', ')}]`,
        });
      }

      // 4) Cache resolved values — controllers should NEVER recompute this
      req.teamId = teamId;
      req.memberRole = membership.role;
      req.resolutionPath = resolutionPath;

      next();
    } catch (err) {
      console.error(`[req:${reqId}][auth] ERROR:`, err);
      res.status(500).json({ message: 'Authorization error', error: err.message, reqId });
    }
  };
};
