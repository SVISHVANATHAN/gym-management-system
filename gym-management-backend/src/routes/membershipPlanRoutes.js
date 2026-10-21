import express from "express";
import { getMembershipPlan ,getMembershipPlanById ,createMembershipPlan,updateMembershipPlan ,deleteMembershipPlan } from "../controllers/membershipPlanController.js";
import {protect} from "../middleware/authMiddleware.js"
const router = express.Router();

router.get("/membership-plans",protect, getMembershipPlan);
router.get("/membership-plans/:id",protect, getMembershipPlanById);
router.post("/membership-plans",protect,createMembershipPlan);
router.patch("/membership-plans/:id",protect,updateMembershipPlan);
router.delete("/membership-plans/:id",protect,deleteMembershipPlan);

export default router;