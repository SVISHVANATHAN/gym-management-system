import express from "express";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import memberRoutes from "./routes/memberRoutes.js"
import membersshipPlanRoutes from "./routes/membershipPlanRoutes.js"
import membershipRoutes from "./routes/membershipRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js";
import cors from "cors";


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Gym Management API is running"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/",adminRoutes);
app.use("/api/",memberRoutes);
app.use("/api/",membersshipPlanRoutes);
app.use("/api/",membershipRoutes);
app.use("/api/", paymentRoutes);
export default app;