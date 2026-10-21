import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {getPayments,getPaymentById,createPayment,updatePayment,deletePayment
} from "../controllers/paymentController.js";

const router = express.Router();

router.get("/payments", protect, getPayments);
router.get("/payments/:id", protect, getPaymentById);
router.post("/payments", protect, createPayment);
router.patch("/payments/:id", protect, updatePayment);
router.delete("/payments/:id", protect, deletePayment);

export default router;