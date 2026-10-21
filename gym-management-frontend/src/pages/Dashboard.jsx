import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    Button,
    Stack,
    Divider,
} from "@mui/material";

import {
    PeopleAlt,
    FitnessCenter,
    CardMembership,
    Payments,
    CurrencyRupee,
} from "@mui/icons-material";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_BASE_URL = "http://localhost:5000/api";
const PAYMENT_STATUS_COLORS = {
    paid: "#22C55E",
    pending: "#F59E0B",
    failed: "#EF4444",
    refunded: "#3B82F6",
};
const MEMBERSHIP_STATUS_COLORS = {
    Active: "#22C55E",
    Expired: "#EF4444",
    Upcoming: "#F59E0B",
    Unknown: "#9CA3AF",
};

const getArrayData = (response) => {
    const data = response?.data?.data;
    return Array.isArray(data) ? data : [];
};

const parseDate = (value) => {
    if (!value) return null;

    const match = typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const date = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const startOfDay = (date) => {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
};

const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    })}`;

const formatDate = (value) => {
    const date = parseDate(value);
    return date
        ? date.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
          })
        : "—";
};

const getPaymentStatus = (payment) =>
    String(payment?.payment_status || "unknown").trim().toLowerCase();

const getMembershipStatus = (membership, today) => {
    const start = parseDate(membership?.start_date);
    const end = parseDate(membership?.end_date);
    if (!start || !end) return "Unknown";
    const normalizedToday = startOfDay(today);
    const normalizedStart = startOfDay(start);
    const normalizedEnd = startOfDay(end);
    if (normalizedStart > normalizedToday) return "Upcoming";
    if (normalizedEnd < normalizedToday) return "Expired";
    return "Active";
};

const Dashboard = () => {
    const navigate = useNavigate();

    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const fetchDashboardData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const config = {
            headers: { Authorization: `Bearer ${token}` },
        };

        try {
            setIsLoading(true);
            setErrorMessage("");
            const [membersResponse, plansResponse, membershipsResponse, paymentsResponse] =
                await Promise.all([
                    axios.get(`${API_BASE_URL}/members`, config),
                    axios.get(`${API_BASE_URL}/membership-plans`, config),
                    axios.get(`${API_BASE_URL}/memberships`, config),
                    axios.get(`${API_BASE_URL}/payments`, config),
                ]);

            setMembers(getArrayData(membersResponse));
            setPlans(getArrayData(plansResponse));
            setMemberships(getArrayData(membershipsResponse));
            setPayments(getArrayData(paymentsResponse));
        } catch (error) {
            console.error("Dashboard data error:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
            setErrorMessage(
                error.response?.data?.message ||
                    "Failed to load dashboard data. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        
    }, [navigate]);

    const today = useMemo(() => startOfDay(new Date()), []);

    const membershipStatusData = useMemo(() => {
        const counts = { Active: 0, Expired: 0, Upcoming: 0, Unknown: 0 };
        memberships.forEach((membership) => {
            counts[getMembershipStatus(membership, new Date())] += 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: MEMBERSHIP_STATUS_COLORS[name],
        }));
    }, [memberships]);

    const paymentStatusData = useMemo(() => {
        const labels = { paid: "Paid", pending: "Pending", failed: "Failed", refunded: "Refunded" };
        const counts = { paid: 0, pending: 0, failed: 0, refunded: 0, other: 0 };
        payments.forEach((payment) => {
            const status = getPaymentStatus(payment);
            if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status] += 1;
            else counts.other += 1;
        });
        const data = Object.keys(labels).map((status) => ({
            name: labels[status],
            value: counts[status],
            color: PAYMENT_STATUS_COLORS[status],
        }));
        if (counts.other > 0) data.push({ name: "Other", value: counts.other, color: "#9CA3AF" });
        return data;
    }, [payments]);

    const monthlyRevenueData = useMemo(() => {
        const now = new Date();
        const months = [];
        for (let offset = 11; offset >= 0; offset -= 1) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
            months.push({
                key: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`,
                month: monthDate.toLocaleDateString("en-IN", { month: "short" }),
                revenue: 0,
            });
        }
        const monthMap = new Map(months.map((month) => [month.key, month]));
        payments.forEach((payment) => {
            if (getPaymentStatus(payment) !== "paid") return;
            const date = parseDate(payment.payment_date);
            if (!date) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const bucket = monthMap.get(key);
            if (bucket) bucket.revenue += Number(payment.amount) || 0;
        });
        return months;
    }, [payments]);

    const totalRevenue = useMemo(
        () => payments.reduce((total, payment) => {
            if (getPaymentStatus(payment) === "paid") return total + (Number(payment.amount) || 0);
            return total;
        }, 0),
        [payments]
    );

    const activeMemberships = useMemo(
        () => memberships.filter((membership) => getMembershipStatus(membership, today) === "Active").length,
        [memberships, today]
    );

    const dashboardCards = [
        {
            title: "Total Members",
            value: members.length,
            icon: <PeopleAlt sx={{ fontSize: 30 }} />,
            background: "#DBEAFE",
            iconColor: "#2563EB",
        },
        {
            title: "Membership Plans",
            value: plans.length,
            icon: <CardMembership sx={{ fontSize: 30 }} />,
            background: "#EDE9FE",
            iconColor: "#7C3AED",
        },
        {
            title: "Active Memberships",
            value: activeMemberships,
            icon: <FitnessCenter sx={{ fontSize: 30 }} />,
            background: "#D1FAE5",
            iconColor: "#059669",
        },
        {
            title: "Total Payments",
            value: payments.length,
            icon: <Payments sx={{ fontSize: 30 }} />,
            background: "#FEF3C7",
            iconColor: "#D97706",
        },
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            icon: <CurrencyRupee sx={{ fontSize: 30 }} />,
            background: "#FCE7F3",
            iconColor: "#DB2777",
        },
    ];

    const recentMembers = useMemo(() => {
        return [...members]
            .sort((a, b) => {
                const dateA = parseDate(a.join_date || a.created_at || a.createdAt)?.getTime() || 0;
                const dateB = parseDate(b.join_date || b.created_at || b.createdAt)?.getTime() || 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [members]);

    const recentPayments = useMemo(() => {
        return [...payments]
            .sort((a, b) => {
                const dateA = parseDate(a.payment_date || a.created_at)?.getTime() || 0;
                const dateB = parseDate(b.payment_date || b.created_at)?.getTime() || 0;
                if (dateA !== dateB) return dateB - dateA;
                return Number(b.id || 0) - Number(a.id || 0);
            })
            .slice(0, 5);
    }, [payments]);

    const statusChip = (status) => {
        const normalized = String(status || "unknown").toLowerCase();
        const color = PAYMENT_STATUS_COLORS[normalized] || "#9CA3AF";
        return (
            <Box
                component="span"
                sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.4,
                    borderRadius: 1.5,
                    fontSize: 12,
                    fontWeight: 700,
                    color,
                    backgroundColor: `${color}1A`,
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                }}
            >
                {normalized}
            </Box>
        );
    };

    const chartCardSx = {
        p: { xs: 2, sm: 2.5 },
        width: "100%",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        borderRadius: 3,
        border: "1px solid #E5E7EB",
        backgroundColor: "#FFFFFF",
    };

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                width: "100%",
                maxWidth: "100%",
                backgroundColor: "#F3F4F6",
                overflowX: "clip",
            }}
        >
            <Sidebar />
            <Box sx={{ flexGrow: 1, flexShrink: 1, minWidth: 0, width: 0, maxWidth: "100%", overflowX: "hidden" }}>
                <Navbar />
                <Box sx={{ width: "100%", maxWidth: "100%", minWidth: 0, p: { xs: 2, sm: 2.5, md: 3 }, boxSizing: "border-box" }}>
                    <Box sx={{ mb: 0.5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>Dashboard</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: "#6B7280", mt: 0.5, mb: 3 }}>
                        Overview of your gym management system.
                    </Typography>

                    {errorMessage && (
                        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchDashboardData}>Retry</Button>}>
                            {errorMessage}
                        </Alert>
                    )}

                    {isLoading ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
                            <CircularProgress />
                            <Typography variant="body2" sx={{ mt: 2, color: "#6B7280" }}>Loading dashboard statistics...</Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" }, gap: 2, width: "100%", minWidth: 0, maxWidth: "100%" }}>
                                {dashboardCards.map((card) => (
                                    <Card key={card.title} elevation={0} sx={{ minWidth: 0, minHeight: 154, borderRadius: 3, border: "1px solid #E5E7EB", transition: "0.2s", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" } }}>
                                        <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 2.5, backgroundColor: card.background, color: card.iconColor, flexShrink: 0 }}>{card.icon}</Box>
                                                <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600, lineHeight: 1.4, overflowWrap: "anywhere" }}>{card.title}</Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", overflowWrap: "anywhere", fontSize: card.title === "Total Revenue" ? "clamp(1.1rem, 1.4vw, 1.65rem)" : "clamp(1.5rem, 1.8vw, 2rem)" }}>{card.value}</Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>

                            
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1.2fr) minmax(0, 0.8fr)" }, gap: 2, mt: 3, width: "100%", minWidth: 0, maxWidth: "100%", alignItems: "stretch" }}>
                                <Card elevation={0} sx={chartCardSx}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mb: 3 }}>Monthly Revenue</Typography>
                                    <Box sx={{ width: "100%", minWidth: 0, maxWidth: "100%", height: { xs: 260, sm: 300 }, overflow: "hidden" }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barCategoryGap="25%">
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                <XAxis dataKey="month" tick={{ fill: "#374151", fontSize: 12 }} axisLine={{ stroke: "#D1D5DB" }} tickLine={false} />
                                                <YAxis width={75} domain={[0, "auto"]} tick={{ fill: "#374151", fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} axisLine={false} tickLine={false} />
                                                <Tooltip formatter={(value) => [formatCurrency(value), "Revenue"]} contentStyle={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
                                                <Bar dataKey="revenue" name="Revenue" fill="#4A90F5" radius={[3, 3, 0, 0]} maxBarSize={45} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: "#6B7280" }}>Revenue includes payments marked as paid over the last 12 months.</Typography>
                                </Card>

                                <Card elevation={0} sx={chartCardSx}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mb: 2 }}>Payment Status</Typography>
                                    {payments.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: "#6B7280", py: 8, textAlign: "center" }}>No payment records yet.</Typography>
                                    ) : (
                                        <>
                                            <Box sx={{ width: "100%", minWidth: 0, height: 230 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={paymentStatusData.filter((item) => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="78%" paddingAngle={2} stroke="none">
                                                            {paymentStatusData.filter((item) => item.value > 0).map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                                        </Pie>
                                                        {/* Center label: total payments */}
                                                        <text
                                                            x="50%"
                                                            y="47%"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            style={{ fontSize: 24, fontWeight: 700, fill: "#111827" }}
                                                            pointerEvents="none"
                                                        >
                                                            {payments.length}
                                                        </text>
                                                        <text
                                                            x="50%"
                                                            y="58%"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            style={{ fontSize: 11, fill: "#6B7280" }}
                                                            pointerEvents="none"
                                                        >
                                                            Payments
                                                        </text>
                                                        <Tooltip formatter={(value, name) => [`${value} payment${value === 1 ? "" : "s"}`, name]} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                            <Stack spacing={1.2}>
                                                {paymentStatusData.map((status) => {
                                                    const percentage = payments.length ? Math.round((status.value / payments.length) * 100) : 0;
                                                    return (
                                                        <Box key={status.name} sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                                            <Box sx={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: status.color, flexShrink: 0 }} />
                                                            <Typography variant="body2" sx={{ flexGrow: 1, color: "#374151" }}>{status.name}</Typography>
                                                            <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600, whiteSpace: "nowrap" }}>{status.value} ({percentage}%)</Typography>
                                                        </Box>
                                                    );
                                                })}
                                            </Stack>
                                        </>
                                    )}
                                </Card>
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) minmax(0, 1fr)" }, gap: 2, mt: 2, width: "100%", minWidth: 0 }}>
                                <Card elevation={0} sx={chartCardSx}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mb: 2 }}>Membership Status</Typography>
                                    {memberships.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: "#6B7280", py: 8, textAlign: "center" }}>No membership records yet.</Typography>
                                    ) : (
                                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) minmax(0, 1fr)" }, alignItems: "center", gap: 1, minWidth: 0 }}>
                                            <Box sx={{ width: "100%", minWidth: 0, height: 240 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={membershipStatusData.filter((item) => item.value > 0)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="78%" paddingAngle={2} stroke="none">
                                                            {membershipStatusData.filter((item) => item.value > 0).map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                                        </Pie>
                                                        {/* Center label: total memberships */}
                                                        <text
                                                            x="50%"
                                                            y="47%"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            style={{ fontSize: 24, fontWeight: 700, fill: "#111827" }}
                                                            pointerEvents="none"
                                                        >
                                                            {memberships.length}
                                                        </text>
                                                        <text
                                                            x="50%"
                                                            y="58%"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            style={{ fontSize: 11, fill: "#6B7280" }}
                                                            pointerEvents="none"
                                                        >
                                                            Memberships
                                                        </text>
                                                        <Tooltip formatter={(value, name) => [`${value} membership${value === 1 ? "" : "s"}`, name]} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </Box>
                                            <Stack spacing={1.5} sx={{ px: { xs: 1, sm: 0 } }}>
                                                {membershipStatusData.map((status) => (
                                                    <Box key={status.name} sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                                                        <Box sx={{ width: 11, height: 11, borderRadius: "50%", backgroundColor: status.color, flexShrink: 0 }} />
                                                        <Typography variant="body2" sx={{ flexGrow: 1, color: "#374151" }}>{status.name}</Typography>
                                                        <Typography variant="body2" sx={{ color: "#111827", fontWeight: 600 }}>{status.value}</Typography>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>
                                    )}
                                </Card>

                                {/* Recent members */}
                                <Card elevation={0} sx={chartCardSx}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mb: 2 }}>Recent Members</Typography>
                                    {recentMembers.length === 0 ? (
                                        <Typography variant="body2" sx={{ color: "#6B7280", py: 4, textAlign: "center" }}>No members found.</Typography>
                                    ) : (
                                        <Stack divider={<Divider flexItem />} spacing={0}>
                                            {recentMembers.map((member, index) => (
                                                <Box key={member.id ?? member.email ?? index} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, py: 1.4, minWidth: 0 }}>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#111827", overflowWrap: "anywhere" }}>{member.name || "Unnamed member"}</Typography>
                                                        <Typography variant="caption" sx={{ display: "block", color: "#6B7280", overflowWrap: "anywhere" }}>{member.email || member.phone || "No contact details"}</Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: "#6B7280", whiteSpace: "nowrap", flexShrink: 0 }}>{formatDate(member.join_date || member.created_at || member.createdAt)}</Typography>
                                                </Box>
                                            ))}
                                        </Stack>
                                    )}
                                </Card>
                            </Box>

                            <Card elevation={0} sx={{ ...chartCardSx, mt: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "#111827", mb: 2 }}>Recent Payments</Typography>
                                {recentPayments.length === 0 ? (
                                    <Typography variant="body2" sx={{ color: "#6B7280", py: 4, textAlign: "center" }}>No payment records found.</Typography>
                                ) : (
                                    <Box sx={{ width: "100%", overflowX: "auto" }}>
                                        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 560, "& th": { textAlign: "left", color: "#6B7280", fontSize: 12, fontWeight: 700, py: 1.2, px: 1, borderBottom: "1px solid #E5E7EB" }, "& td": { py: 1.5, px: 1, borderBottom: "1px solid #F3F4F6", fontSize: 14, color: "#374151" }, "& tbody tr:last-child td": { borderBottom: 0 } }}>
                                            <thead>
                                                <tr><th>Member</th><th>Plan</th><th>Payment Date</th><th>Amount</th><th>Status</th></tr>
                                            </thead>
                                            <tbody>
                                                {recentPayments.map((payment, index) => (
                                                    <tr key={payment.id ?? index}>
                                                        <td>{payment.member_name || payment.name || (payment.membership_id ? `Membership #${payment.membership_id}` : "—")}</td>
                                                        <td>{payment.plan_name || "—"}</td>
                                                        <td>{formatDate(payment.payment_date || payment.created_at)}</td>
                                                        <td>{formatCurrency(payment.amount)}</td>
                                                        <td>{statusChip(payment.payment_status)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Box>
                                    </Box>
                                )}
                            </Card>
                        </>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default Dashboard;
