import express from "express";
import { getAdmin,getElementById,deleteAdmin,updateAdmin } from "../controllers/adminController.js";
import {protect} from "../middleware/authMiddleware.js"
const router = express.Router();

router.get("/admins",protect, getAdmin);
router.get("/admin/:id",protect,getElementById)
router.delete("/admin/:id",protect,deleteAdmin)
router.patch("/admin/:id",protect,updateAdmin)
export default router;