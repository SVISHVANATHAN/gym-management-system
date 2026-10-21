import express from "express";
import { getMembers,getMemberById,createMember,updateMember,deleteMember } from "../controllers/memberController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/members",protect, getMembers);
router.get("/member/:id",protect,getMemberById);
router.post("/member/",protect,createMember);
router.patch("/member/:id",protect,updateMember);
router.delete("/member/:id",protect,deleteMember);

export default router;