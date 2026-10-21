import { useEffect, useState } from "react";
import axios from "axios";

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    Add,
    Close,
    Delete,
    Edit,
    Search,
    Visibility,
} from "@mui/icons-material";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000/api/payments";
const MEMBERSHIPS_API_URL = "http://localhost:5000/api/memberships";
const PLANS_API_URL = "http://localhost:5000/api/membership-plans";

const getTodayDate = () => {
    const today = new Date();

    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");
};

const createInitialForm = () => ({
    membership_id: "",
    amount: "",
    payment_date: getTodayDate(),
    payment_method: "upi",
    payment_status: "paid",
    transaction_id: "",
    notes: "",
});

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "upi", label: "UPI" },
    { value: "card", label: "Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
];

const PAYMENT_STATUSES = [
    { value: "paid", label: "Paid" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
];

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case "paid":
            return "success";
        case "pending":
            return "warning";
        case "failed":
            return "error";
        case "refunded":
            return "info";
        default:
            return "default";
    }
};

const formatDate = (date) => {
    if (!date) return "N/A";

    const dateString = String(date).slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);

    if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
    }

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
        ? "N/A"
        : parsedDate.toLocaleDateString("en-IN");
};

const formatAmount = (amount) => {
    if (
        amount === null ||
        amount === undefined ||
        amount === "" ||
        !Number.isFinite(Number(amount))
    ) {
        return "N/A";
    }

    return `₹${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [plans, setPlans] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingOptions, setIsLoadingOptions] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [methodFilter, setMethodFilter] = useState("all");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [formOpen, setFormOpen] = useState(false);
    const [viewOpen, setViewOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [editingPaymentId, setEditingPaymentId] = useState(null);

    const [formData, setFormData] = useState(createInitialForm);
    const [formErrors, setFormErrors] = useState({});

    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const getToken = () => localStorage.getItem("token");

    const getAuthConfig = () => ({
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    const showNotification = (message, severity = "success") => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const handleApiError = (error, fallbackMessage) => {
        console.error(fallbackMessage, error);

        showNotification(
            error.response?.data?.message || fallbackMessage,
            "error"
        );
    };

    const fetchPayments = async () => {
        if (!getToken()) {
            setErrorMessage("You are not logged in.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                API_URL,
                getAuthConfig()
            );

            const data = response.data.data;

            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch payments error:", error);

            setErrorMessage(
                error.response?.data?.message ||
                    "Failed to load payments."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMemberships = async () => {
        if (!getToken()) return;

        try {
            const response = await axios.get(
                MEMBERSHIPS_API_URL,
                getAuthConfig()
            );

            const data = response.data.data;

            setMemberships(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch memberships error:", error);

            throw error;
        }
    };

    const fetchPlans = async () => {
        if (!getToken()) return;

        try {
            const response = await axios.get(
                PLANS_API_URL,
                getAuthConfig()
            );

            const data = response.data.data;

            setPlans(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Fetch membership plans error:", error);

            throw error;
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    
    const loadPaymentOptions = async () => {
        setIsLoadingOptions(true);

        try {
            await Promise.all([
                fetchMemberships(),
                fetchPlans(),
            ]);

            return true;
        } catch (error) {
            showNotification(
                error.response?.data?.message ||
                    "Failed to load memberships or membership plans.",
                "error"
            );

            return false;
        } finally {
            setIsLoadingOptions(false);
        }
    };

    
    const availableMemberships = memberships.filter((membership) => {
        const alreadyHasPayment = payments.some(
            (payment) =>
                String(payment.membership_id) === String(membership.id)
        );

        return !alreadyHasPayment;
    });

    const getMembershipPlan = (membershipId) => {
        const membership = memberships.find(
            (item) => String(item.id) === String(membershipId)
        );

        if (!membership) return null;

        return (
            plans.find(
                (plan) => String(plan.id) === String(membership.plan_id)
            ) || null
        );
    };

    const handleMembershipChange = (event) => {
        const membershipId = event.target.value;
        const plan = getMembershipPlan(membershipId);

        setFormData((previous) => ({
            ...previous,
            membership_id: membershipId,
            amount:
                plan?.price !== null && plan?.price !== undefined
                    ? String(plan.price)
                    : "",
        }));

        setFormErrors((previous) => ({
            ...previous,
            membership_id: "",
            amount: "",
        }));
    };

    const filteredPayments = payments.filter((payment) => {
        const query = searchTerm.trim().toLowerCase();

        const matchesSearch =
            !query ||
            String(payment.id ?? "").toLowerCase().includes(query) ||
            String(payment.member_name ?? "")
                .toLowerCase()
                .includes(query) ||
            String(payment.plan_name ?? "")
                .toLowerCase()
                .includes(query) ||
            String(payment.transaction_id ?? "")
                .toLowerCase()
                .includes(query);

        const matchesStatus =
            statusFilter === "all" ||
            payment.payment_status?.toLowerCase() === statusFilter;

        const matchesMethod =
            methodFilter === "all" ||
            payment.payment_method?.toLowerCase() === methodFilter;

        return matchesSearch && matchesStatus && matchesMethod;
    });

    const paginatedPayments = filteredPayments.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFormErrors((previous) => ({
            ...previous,
            [name]: "",
        }));
    };

    const openAddDialog = async () => {
        if (!getToken()) {
            showNotification("You are not logged in.", "error");
            return;
        }

        setEditingPaymentId(null);
        setFormData(createInitialForm());
        setFormErrors({});

        const loaded = await loadPaymentOptions();

        if (loaded) {
            setFormData(createInitialForm());
            setFormOpen(true);
        }
    };

    const openEditDialog = async (payment) => {
        if (!getToken()) {
            showNotification("You are not logged in.", "error");
            return;
        }

        const loaded = await loadPaymentOptions();

        if (!loaded) return;

        setEditingPaymentId(payment.id);

        setFormData({
            membership_id: String(payment.membership_id ?? ""),
            amount: String(payment.amount ?? ""),
            payment_date: payment.payment_date
                ? String(payment.payment_date).slice(0, 10)
                : getTodayDate(),
            payment_method: payment.payment_method ?? "upi",
            payment_status: payment.payment_status ?? "paid",
            transaction_id: payment.transaction_id ?? "",
            notes: payment.notes ?? "",
        });

        setFormErrors({});
        setFormOpen(true);
    };

    const closeFormDialog = () => {
        if (isSaving) return;

        setFormOpen(false);
        setEditingPaymentId(null);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.membership_id) {
            errors.membership_id = "Please select a membership.";
        }

        if (
            formData.amount === "" ||
            !Number.isFinite(Number(formData.amount)) ||
            Number(formData.amount) <= 0
        ) {
            errors.amount = "Enter an amount greater than zero.";
        }

        if (!formData.payment_date) {
            errors.payment_date = "Payment date is required.";
        } else {
            const datePattern = /^\d{4}-\d{2}-\d{2}$/;
            const dateParts = formData.payment_date.split("-").map(Number);

            if (!datePattern.test(formData.payment_date)) {
                errors.payment_date = "Enter a valid payment date.";
            } else {
                const [year, month, day] = dateParts;
                const date = new Date(year, month - 1, day);

                if (
                    date.getFullYear() !== year ||
                    date.getMonth() !== month - 1 ||
                    date.getDate() !== day
                ) {
                    errors.payment_date = "Enter a valid payment date.";
                }
            }
        }

        if (
            !PAYMENT_METHODS.some(
                (method) => method.value === formData.payment_method
            )
        ) {
            errors.payment_method = "Select a valid payment method.";
        }

        if (
            !PAYMENT_STATUSES.some(
                (status) => status.value === formData.payment_status
            )
        ) {
            errors.payment_status = "Select a valid payment status.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmitPayment = async (event) => {
        event.preventDefault();

        if (!getToken()) {
            showNotification("You are not logged in.", "error");
            return;
        }

        if (!validateForm()) return;

        if (editingPaymentId === null) {
            const existingPayment = payments.some(
                (payment) =>
                    String(payment.membership_id) ===
                    String(formData.membership_id)
            );

            if (existingPayment) {
                showNotification(
                    "This membership already has a payment record.",
                    "error"
                );
                return;
            }
        }

        const payload = {
            membership_id: Number(formData.membership_id),
            amount: Number(formData.amount),
            payment_date: formData.payment_date,
            payment_method: formData.payment_method,
            payment_status: formData.payment_status,
            transaction_id: formData.transaction_id.trim(),
            notes: formData.notes.trim(),
        };

        try {
            setIsSaving(true);

            if (editingPaymentId !== null) {
                await axios.patch(
                    `${API_URL}/${editingPaymentId}`,
                    payload,
                    getAuthConfig()
                );

                showNotification("Payment updated successfully.");
            } else {
                await axios.post(
                    API_URL,
                    payload,
                    getAuthConfig()
                );

                showNotification("Payment added successfully.");
            }

            setFormOpen(false);
            setEditingPaymentId(null);
            setFormErrors({});

            await fetchPayments();
        } catch (error) {
            handleApiError(
                error,
                editingPaymentId !== null
                    ? "Failed to update payment."
                    : "Failed to add payment."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const openViewDialog = (payment) => {
        setSelectedPayment(payment);
        setViewOpen(true);
    };

    const openDeleteDialog = (payment) => {
        setSelectedPayment(payment);
        setDeleteOpen(true);
    };

    const closeDeleteDialog = () => {
        if (isSaving) return;

        setDeleteOpen(false);
        setSelectedPayment(null);
    };

    const handleDeletePayment = async () => {
        if (!selectedPayment) return;

        if (!getToken()) {
            showNotification("You are not logged in.", "error");
            return;
        }

        try {
            setIsSaving(true);

            await axios.delete(
                `${API_URL}/${selectedPayment.id}`,
                getAuthConfig()
            );

            const deletedId = selectedPayment.id;

            setPayments((previous) =>
                previous.filter(
                    (payment) => String(payment.id) !== String(deletedId)
                )
            );

            setDeleteOpen(false);
            setSelectedPayment(null);

            showNotification("Payment deleted successfully.");
        } catch (error) {
            handleApiError(error, "Failed to delete payment.");
        } finally {
            setIsSaving(false);
        }
    };

    const membershipLabel = (membership) => {
        const memberName =
            membership.member_name ||
            `Member #${membership.member_id}`;

        const planName =
            membership.plan_name ||
            `Plan #${membership.plan_id}`;

        return `${memberName} — ${planName} (Membership #${membership.id})`;
    };

    
    const dialogMemberships =
        editingPaymentId !== null
            ? memberships.filter(
                  (membership) =>
                      !payments.some(
                          (payment) =>
                              String(payment.membership_id) ===
                                  String(membership.id) &&
                              String(payment.id) !==
                                  String(editingPaymentId)
                      )
              )
            : availableMemberships;

    const handleCloseNotification = (_, reason) => {
        if (reason === "clickaway") return;

        setNotification((previous) => ({
            ...previous,
            open: false,
        }));
    };

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#F3F4F6",
            }}
        >
            <Sidebar />

            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Navbar />

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        sx={{
                            justifyContent: "space-between",
                            alignItems: {
                                xs: "flex-start",
                                sm: "center",
                            },
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 600, color: "#111827" }}
                            >
                                Payments
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{ color: "#6B7280", mt: 0.5 }}
                            >
                                Manage your gym payments here.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={openAddDialog}
                        >
                            Add Payment
                        </Button>
                    </Stack>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{ mt: 3 }}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    onClick={fetchPayments}
                                >
                                    Retry
                                </Button>
                            }
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    <Paper
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 1,
                        }}
                    >
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, md: 5 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Search payment, member, plan, or transaction..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            ),
                                            endAdornment: searchTerm ? (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        aria-label="Clear search"
                                                        onClick={() => {
                                                            setSearchTerm("");
                                                            setPage(0);
                                                        }}
                                                    >
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="payment-status-filter">
                                        Payment Status
                                    </InputLabel>

                                    <Select
                                        labelId="payment-status-filter"
                                        value={statusFilter}
                                        label="Payment Status"
                                        onChange={(event) => {
                                            setStatusFilter(event.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        <MenuItem value="all">
                                            All Statuses
                                        </MenuItem>

                                        {PAYMENT_STATUSES.map((status) => (
                                            <MenuItem
                                                key={status.value}
                                                value={status.value}
                                            >
                                                {status.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="payment-method-filter">
                                        Payment Method
                                    </InputLabel>

                                    <Select
                                        labelId="payment-method-filter"
                                        value={methodFilter}
                                        label="Payment Method"
                                        onChange={(event) => {
                                            setMethodFilter(event.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        <MenuItem value="all">
                                            All Methods
                                        </MenuItem>

                                        {PAYMENT_METHODS.map((method) => (
                                            <MenuItem
                                                key={method.value}
                                                value={method.value}
                                            >
                                                {method.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 1 }}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setMethodFilter("all");
                                        setPage(0);
                                    }}
                                >
                                    Reset
                                </Button>
                            </Grid>
                        </Grid>

                        {isLoading ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    py: 6,
                                }}
                            >
                                <CircularProgress size={28} />

                                <Typography
                                    variant="body2"
                                    sx={{ mt: 1.5, color: "#6B7280" }}
                                >
                                    Loading payments...
                                </Typography>
                            </Box>
                        ) : errorMessage ? (
                            <Typography
                                sx={{
                                        textAlign: "center",
                                        color: "text.secondary",
                                        py: 4,
                                    }}
                                color="text.secondary"
                            >
                                Unable to load payments.
                            </Typography>
                        ) : payments.length === 0 ? (
                            <Typography
                                
                                color="text.secondary"
                                sx={{ py: 4 ,
                                    textAlign:"center"
                                }}
                            >
                                No payments found. Add your first payment to
                                get started.
                            </Typography>
                        ) : filteredPayments.length === 0 ? (
                            <Typography
                                
                                color="text.secondary"
                                sx={{ py: 4,
                                    textAlign:"center"
                                 }}
                            >
                                No matching payments found.
                            </Typography>
                        ) : (
                            <>
                                <TableContainer sx={{ overflowX: "auto" }}>
                                    <Table sx={{ minWidth: 950 }}>
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    backgroundColor: "#F9FAFB",
                                                }}
                                            >
                                                {[
                                                    "Payment ID",
                                                    "Member Name",
                                                    "Plan Name",
                                                    "Amount",
                                                    "Payment Date",
                                                    "Payment Method",
                                                    "Status",
                                                    "Actions",
                                                ].map((heading) => (
                                                    <TableCell
                                                        key={heading}
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: "#374151",
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {heading}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {paginatedPayments.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    hover
                                                >
                                                    <TableCell>
                                                        {payment.id}
                                                    </TableCell>

                                                    <TableCell>
                                                        {payment.member_name || "N/A"}
                                                    </TableCell>

                                                    <TableCell>
                                                        {payment.plan_name || "N/A"}
                                                    </TableCell>

                                                    <TableCell
                                                        sx={{
                                                            fontWeight: 600,
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {formatAmount(payment.amount)}
                                                    </TableCell>

                                                    <TableCell>
                                                        {formatDate(payment.payment_date)}
                                                    </TableCell>

                                                    <TableCell
                                                        sx={{
                                                            textTransform: "capitalize",
                                                        }}
                                                    >
                                                        {payment.payment_method
                                                            ?.replace(/_/g, " ") || "N/A"}
                                                    </TableCell>

                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            variant="outlined"
                                                            label={
                                                                payment.payment_status
                                                                    ? payment.payment_status
                                                                          .charAt(0)
                                                                          .toUpperCase() +
                                                                      payment.payment_status.slice(1)
                                                                    : "Unknown"
                                                            }
                                                            color={getStatusColor(
                                                                payment.payment_status
                                                            )}
                                                        />
                                                    </TableCell>

                                                    <TableCell>
                                                        <Stack
                                                            direction="row"
                                                            spacing={0.5}
                                                        >
                                                            <Tooltip title="View payment">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() =>
                                                                        openViewDialog(payment)
                                                                    }
                                                                >
                                                                    <Visibility />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Tooltip title="Edit payment">
                                                                <IconButton
                                                                    size="small"
                                                                    color="primary"
                                                                    onClick={() =>
                                                                        openEditDialog(payment)
                                                                    }
                                                                >
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>

                                                            <Tooltip title="Delete payment">
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() =>
                                                                        openDeleteDialog(payment)
                                                                    }
                                                                >
                                                                    <Delete />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    component="div"
                                    count={filteredPayments.length}
                                    page={page}
                                    onPageChange={(_, newPage) =>
                                        setPage(newPage)
                                    }
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={(event) => {
                                        setRowsPerPage(Number(event.target.value));
                                        setPage(0);
                                    }}
                                    rowsPerPageOptions={[5, 10, 25, 50]}
                                />
                            </>
                        )}
                    </Paper>
                </Box>
            </Box>

            <Dialog
                open={formOpen}
                onClose={closeFormDialog}
                fullWidth
                maxWidth="sm"
            >
                <Box component="form" onSubmit={handleSubmitPayment}>
                    <DialogTitle>
                        {editingPaymentId !== null
                            ? "Edit Payment"
                            : "Add Payment"}
                    </DialogTitle>

                    <DialogContent dividers>
                        {isLoadingOptions ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    py: 4,
                                }}
                            >
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {editingPaymentId === null &&
                                    availableMemberships.length === 0 && (
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            All memberships already have payment
                                            records. Create a new membership
                                            before adding another payment.
                                        </Alert>
                                    )}

                                <Stack spacing={2} sx={{ pt: 1 }}>
                                    <FormControl
                                        fullWidth
                                        error={Boolean(formErrors.membership_id)}
                                        disabled={
                                            editingPaymentId === null &&
                                            availableMemberships.length === 0
                                        }
                                    >
                                        <InputLabel id="membership-select-label">
                                            Membership
                                        </InputLabel>

                                        <Select
                                            labelId="membership-select-label"
                                            name="membership_id"
                                            value={formData.membership_id}
                                            label="Membership"
                                            onChange={handleMembershipChange}
                                        >
                                            {dialogMemberships.map((membership) => (
                                                <MenuItem
                                                    key={membership.id}
                                                    value={String(membership.id)}
                                                >
                                                    {membershipLabel(membership)}
                                                </MenuItem>
                                            ))}
                                        </Select>

                                        {formErrors.membership_id && (
                                            <Typography
                                                variant="caption"
                                                color="error"
                                            >
                                                {formErrors.membership_id}
                                            </Typography>
                                        )}
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        label="Amount"
                                        name="amount"
                                        type="number"
                                        value={formData.amount}
                                        error={Boolean(formErrors.amount)}
                                        helperText={
                                            formErrors.amount ||
                                            (editingPaymentId === null
                                                ? "Automatically filled from the selected membership plan."
                                                : "Existing payment amount. Change it only if necessary.")
                                        }
                                        onChange={handleFormChange}
                                        slotProps={{
                                            htmlInput: {
                                                min: 0.01,
                                                step: 0.01,
                                            },
                                            input: {
                                                readOnly: editingPaymentId === null,
                                            },
                                        }}
                                        required
                                    />

                                    <TextField
                                        fullWidth
                                        label="Payment Date"
                                        name="payment_date"
                                        type="date"
                                        value={formData.payment_date}
                                        onChange={handleFormChange}
                                        error={Boolean(formErrors.payment_date)}
                                        helperText={formErrors.payment_date}
                                        slotProps={{
                                            inputLabel: {
                                                shrink: true,
                                            },
                                        }}
                                        required
                                    />

                                    <FormControl fullWidth>
                                        <InputLabel id="payment-method-label">
                                            Payment Method
                                        </InputLabel>

                                        <Select
                                            labelId="payment-method-label"
                                            name="payment_method"
                                            value={formData.payment_method}
                                            label="Payment Method"
                                            onChange={handleFormChange}
                                        >
                                            {PAYMENT_METHODS.map((method) => (
                                                <MenuItem
                                                    key={method.value}
                                                    value={method.value}
                                                >
                                                    {method.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <FormControl fullWidth>
                                        <InputLabel id="payment-status-label">
                                            Payment Status
                                        </InputLabel>

                                        <Select
                                            labelId="payment-status-label"
                                            name="payment_status"
                                            value={formData.payment_status}
                                            label="Payment Status"
                                            onChange={handleFormChange}
                                        >
                                            {PAYMENT_STATUSES.map((status) => (
                                                <MenuItem
                                                    key={status.value}
                                                    value={status.value}
                                                >
                                                    {status.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <TextField
                                        fullWidth
                                        label="Transaction ID"
                                        name="transaction_id"
                                        value={formData.transaction_id}
                                        onChange={handleFormChange}
                                    />

                                    <TextField
                                        fullWidth
                                        label="Notes"
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleFormChange}
                                        multiline
                                        rows={3}
                                    />
                                </Stack>
                            </>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={closeFormDialog}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                isSaving ||
                                isLoadingOptions ||
                                (editingPaymentId === null &&
                                    availableMemberships.length === 0)
                            }
                        >
                            {isSaving ? (
                                <CircularProgress size={22} color="inherit" />
                            ) : editingPaymentId !== null ? (
                                "Save Changes"
                            ) : (
                                "Add Payment"
                            )}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={viewOpen}
                onClose={() => setViewOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Payment Details</DialogTitle>

                <DialogContent dividers>
                    {selectedPayment && (
                        <Stack spacing={2}>
                            {[
                                ["Payment ID", selectedPayment.id],
                                ["Member Name", selectedPayment.member_name || "N/A"],
                                ["Plan Name", selectedPayment.plan_name || "N/A"],
                                ["Membership ID", selectedPayment.membership_id ?? "N/A"],
                                ["Amount", formatAmount(selectedPayment.amount)],
                                ["Payment Date", formatDate(selectedPayment.payment_date)],
                                ["Payment Method", selectedPayment.payment_method || "N/A"],
                                ["Transaction ID", selectedPayment.transaction_id || "N/A"],
                                ["Notes", selectedPayment.notes || "N/A"],
                            ].map(([label, value]) => (
                                <Box
                                    key={label}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 2,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {label}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            textAlign: "right",
                                            overflowWrap: "anywhere",
                                        }}
                                    >
                                        {value}
                                    </Typography>
                                </Box>
                            ))}

                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Payment Status
                                </Typography>

                                <Chip
                                    size="small"
                                    label={selectedPayment.payment_status || "Unknown"}
                                    color={getStatusColor(
                                        selectedPayment.payment_status
                                    )}
                                />
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setViewOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteOpen}
                onClose={closeDeleteDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Delete Payment</DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to delete payment #
                        {selectedPayment?.id}? This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={closeDeleteDialog}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeletePayment}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <CircularProgress size={22} color="inherit" />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Payments;