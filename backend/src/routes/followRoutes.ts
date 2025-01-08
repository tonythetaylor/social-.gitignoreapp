// src/routes/followRoutes.ts

import { Router } from "express";
import {
  fetchFollowers,
  fetchFollowing,
  fetchPendingFollows,
  followUser,
  unfollow,
  acceptFollow,
  rejectFollow,
} from "../controllers/followController";
import authenticateJWT from "../middleware/authMiddleware"; // Ensure you have JWT authentication middleware

const router = Router();

// GET /user/followers
router.get("/followers", authenticateJWT, fetchFollowers);

// GET /user/following
router.get("/following", authenticateJWT, fetchFollowing);

// GET /user/pending-follows
router.get("/pending-follows", authenticateJWT, fetchPendingFollows);

// POST /user/follow
router.post("/user", authenticateJWT, followUser);

// DELETE /user/unfollow/:followingId
router.delete("/unfollow/:followingId", authenticateJWT, unfollow);

// POST /user/follow/accept/:followId
router.post("/accept/:followId", authenticateJWT, acceptFollow);

// POST /user/follow/reject/:followId
router.post("/reject/:followId", authenticateJWT, rejectFollow);

export default router;