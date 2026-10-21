import express from "express";
import { getMemberships,getMembershipById ,createMembership,updateMembership,deleteMembership } from "../controllers/membershipController.js";
import {protect} from "../middleware/authMiddleware.js"
const router = express.Router();

router.get("/memberships",protect, getMemberships);
router.get("/memberships/:id",protect,getMembershipById);
router.post("/memberships",protect,createMembership);
router.put("/memberships/:id",protect,updateMembership);
router.delete("/memberships/:id",protect,deleteMembership);

export default router;