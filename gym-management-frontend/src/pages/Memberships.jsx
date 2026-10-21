import { useState, useEffect, useMemo } from "react";
import axios from "axios";

import {
    Box,
    Typography,
    Paper,
    Button,
    TextField,
    MenuItem,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Snackbar,
    Chip,
    InputAdornment,
    TablePagination,
    Stack,
} from "@mui/material";

import {
    Add,
    Search,
    Visibility,
    Edit,
    Delete,
    Close,
} from "@mui/icons-material";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000/api";

const initialFormData = {
    member_id: "",
    plan_id: "",
    start_date: new Date().toLocaleDateString("en-CA"),
};

const Memberships = () => {
    const [memberships, setMemberships] = useState([]);
    const [members, setMembers] = useState([]);
    const [plans, setPlans] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlan, setSelectedPlan] = useState("");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [openForm, setOpenForm] = useState(false);
    const [openView, setOpenView] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const [selectedMembership, setSelectedMembership] =
        useState(null);

    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});

    const [editingId, setEditingId] = useState(null);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const token = localStorage.getItem("token");

    const authConfig = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((previous) => ({
            ...previous,
            open: false,
        }));
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const dateString = String(date).split("T")[0];
        const [year, month, day] = dateString.split("-");

        if (!year || !month || !day) {
            return dateString;
        }

        return `${day}-${month}-${year}`;
    };

    const getDateInputValue = (date) => {
        if (!date) {
            return "";
        }

        return String(date).split("T")[0].split(" ")[0];
    };

    const calculateEndDate = (startDate, durationMonths) => {
        if (!startDate || !durationMonths) {
            return "";
        }

        const [year, month, day] = startDate
            .split("-")
            .map(Number);

        if (!year || !month || !day) {
            return "";
        }

        const targetMonthIndex = month - 1 + Number(durationMonths);

        const targetYear =
            year + Math.floor(targetMonthIndex / 12);

        const targetMonth = (targetMonthIndex % 12) + 1;

        const lastDayOfTargetMonth = new Date(
            targetYear,
            targetMonth,
            0
        ).getDate();

        const targetDay = Math.min(
            day,
            lastDayOfTargetMonth
        );

        return [
            targetYear,
            String(targetMonth).padStart(2, "0"),
            String(targetDay).padStart(2, "0"),
        ].join("-");
    };

    const getPlanName = (membership) => {
        if (membership.plan_name) {
            return membership.plan_name;
        }

        const plan = plans.find(
            (item) =>
                Number(item.id) === Number(membership.plan_id)
        );

        return plan?.name || "Unknown plan";
    };

    const getMemberName = (membership) => {
        if (membership.member_name) {
            return membership.member_name;
        }

        const member = members.find(
            (item) =>
                Number(item.id) === Number(membership.member_id)
        );

        return member?.name || "Unknown member";
    };

    const getPlanDuration = (planId) => {
        const plan = plans.find(
            (item) => Number(item.id) === Number(planId)
        );

        return plan?.duration_months || "";
    };

    const getMembershipEndDate = (membership) => {
        if (membership.end_date) {
            return membership.end_date;
        }

        const duration = getPlanDuration(membership.plan_id);

        return calculateEndDate(
            getDateInputValue(membership.start_date),
            duration
        );
    };

    const fetchMemberships = async () => {
        if (!localStorage.getItem("token")) {
            setErrorMessage("You are not logged in.");
            return;
        }

        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await axios.get(
                `${API_URL}/memberships`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            const data = response.data.data;

            setMemberships(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(
                "Fetch memberships error:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                    "Failed to load memberships."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/members`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setMembers(
                Array.isArray(response.data.data)
                    ? response.data.data
                    : []
            );
        } catch (error) {
            console.error("Fetch members error:", error);

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to load members.",
                "error"
            );
        }
    };

    const fetchPlans = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/membership-plans`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setPlans(
                Array.isArray(response.data.data)
                    ? response.data.data
                    : []
            );
        } catch (error) {
            console.error("Fetch plans error:", error);

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to load membership plans.",
                "error"
            );
        }
    };

    useEffect(() => {
        fetchMemberships();
        fetchMembers();
        fetchPlans();
    }, []);

    const filteredMemberships = useMemo(() => {
        return memberships.filter((membership) => {
            const memberName = getMemberName(membership);

            const memberId = String(
                membership.member_id ?? ""
            );

            const matchesSearch =
                memberName
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                memberId.includes(searchTerm.trim());

            const matchesPlan =
                selectedPlan === "" ||
                Number(membership.plan_id) ===
                    Number(selectedPlan);

            return matchesSearch && matchesPlan;
        });
    }, [
        memberships,
        members,
        plans,
        searchTerm,
        selectedPlan,
    ]);

    const paginatedMemberships = filteredMemberships.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handlePlanFilterChange = (event) => {
        setSelectedPlan(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(Number(event.target.value));
        setPage(0);
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            ...initialFormData,
            start_date: new Date()
                .toLocaleDateString("en-CA"),
        });
        setFormErrors({});
        setOpenForm(true);
    };

    const handleOpenEdit = (membership) => {
        setEditingId(membership.id);

        setFormData({
            member_id: String(membership.member_id ?? ""),
            plan_id: String(membership.plan_id ?? ""),
            start_date: getDateInputValue(
                membership.start_date
            ),
        });

        setFormErrors({});
        setOpenForm(true);
    };

    const handleOpenView = (membership) => {
        setSelectedMembership(membership);
        setOpenView(true);
    };

    const handleOpenDelete = (membership) => {
        setSelectedMembership(membership);
        setOpenDelete(true);
    };

    const handleCloseForm = () => {
        if (isSaving) {
            return;
        }

        setOpenForm(false);
        setEditingId(null);
        setFormErrors({});
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

    const validateForm = () => {
        const errors = {};

        if (!formData.member_id) {
            errors.member_id = "Please select a member.";
        }

        if (!formData.plan_id) {
            errors.plan_id = "Please select a membership plan.";
        }

        if (!formData.start_date) {
            errors.start_date = "Start date is required.";
        }

        if (
            formData.start_date &&
            !Number.isNaN(
                new Date(
                    `${formData.start_date}T00:00:00`
                ).getTime()
            ) &&
            formData.start_date >
                new Date().toLocaleDateString("en-CA")
        ) {
            errors.start_date =
                "Start date cannot be in the future.";
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                member_id: Number(formData.member_id),
                plan_id: Number(formData.plan_id),
                start_date: formData.start_date,
            };

            if (editingId) {
                await axios.put(
                    `${API_URL}/memberships/${editingId}`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                showSnackbar(
                    "Membership updated successfully."
                );
            } else {
                await axios.post(
                    `${API_URL}/memberships`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                showSnackbar(
                    "Membership created successfully."
                );
            }

            setOpenForm(false);
            setEditingId(null);

            await fetchMemberships();
        } catch (error) {
            console.error(
                "Save membership error:",
                error
            );

            const validationErrors =
                error.response?.data?.errors;

            if (Array.isArray(validationErrors)) {
                const mappedErrors = {};

                validationErrors.forEach((item) => {
                    mappedErrors[item.field] = item.message;
                });

                setFormErrors(mappedErrors);
            }

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to save membership.",
                "error"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMembership) {
            return;
        }

        try {
            await axios.delete(
                `${API_URL}/memberships/${selectedMembership.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            setOpenDelete(false);
            setSelectedMembership(null);

            showSnackbar(
                "Membership deleted successfully."
            );

            await fetchMemberships();
        } catch (error) {
            console.error(
                "Delete membership error:",
                error
            );

            showSnackbar(
                error.response?.data?.message ||
                    "Failed to delete membership.",
                "error"
            );
        }
    };

    const selectedPlanDetails = plans.find(
        (plan) =>
            Number(plan.id) === Number(formData.plan_id)
    );

    const calculatedEndDate = calculateEndDate(
        formData.start_date,
        selectedPlanDetails?.duration_months
    );

    const viewEndDate = selectedMembership
        ? getMembershipEndDate(selectedMembership)
        : "";

    return (
        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#F3F4F6",
            }}
        >
            <Sidebar />

            <Box
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                }}
            >
                <Navbar />

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        sx={{
                                justifyContent: "space-between",
                                alignItems: {
                                    xs: "stretch",
                                    sm: "center",
                                },
                            }}
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 600 }}
                            >
                                Memberships
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#6B7280",
                                    mt: 0.5,
                                }}
                            >
                                Manage your gym memberships here.
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenAdd}
                        >
                            Add Membership
                        </Button>
                    </Stack>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{ mt: 3 }}
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    <Paper
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                        }}
                    >
                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by member name or ID"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                select
                                label="Filter by plan"
                                size="small"
                                value={selectedPlan}
                                onChange={handlePlanFilterChange}
                                sx={{
                                    minWidth: {
                                        xs: "100%",
                                        sm: 220,
                                    },
                                }}
                            >
                                <MenuItem value="">
                                    All Plans
                                </MenuItem>

                                {plans.map((plan) => (
                                    <MenuItem
                                        key={plan.id}
                                        value={String(plan.id)}
                                    >
                                        {plan.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    </Paper>

                    <TableContainer
                        component={Paper}
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                            boxShadow: 1,
                            overflowX: "auto",
                        }}
                    >
                        <Table sx={{ minWidth: 900 }}>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor: "#F9FAFB",
                                    }}
                                >
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Member ID
                                    </TableCell>

                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Member Name
                                    </TableCell>

                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Plan Name
                                    </TableCell>

                                    <TableCell sx={{ fontWeight: 600 }}>
                                        Start Date
                                    </TableCell>

                                    <TableCell sx={{ fontWeight: 600 }}>
                                        End Date
                                    </TableCell>

                                    <TableCell
                                        align="center"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{ py: 5 }}
                                        >
                                            <CircularProgress size={28} />

                                            <Typography
                                                variant="body2"
                                                sx={{ mt: 1 }}
                                            >
                                                Loading memberships...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : errorMessage ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{ py: 4 }}
                                        >
                                            Unable to load memberships.
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedMemberships.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{
                                                py: 5,
                                                color: "#6B7280",
                                            }}
                                        >
                                            No memberships found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedMemberships.map(
                                        (membership) => (
                                            <TableRow
                                                key={membership.id}
                                                hover
                                            >
                                                <TableCell>
                                                    {membership.member_id ?? "—"}
                                                </TableCell>

                                                <TableCell>
                                                    {getMemberName(membership)}
                                                </TableCell>

                                                <TableCell>
                                                    {getPlanName(membership)}
                                                </TableCell>

                                                <TableCell>
                                                    {formatDate(
                                                        membership.start_date
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {formatDate(
                                                        getMembershipEndDate(
                                                            membership
                                                        )
                                                    )}
                                                </TableCell>

                                                <TableCell align="center">
                                                    <Tooltip title="View">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() =>
                                                                handleOpenView(
                                                                    membership
                                                                )
                                                            }
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    membership
                                                                )
                                                            }
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            color="error"
                                                            onClick={() =>
                                                                handleOpenDelete(
                                                                    membership
                                                                )
                                                            }
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={filteredMemberships.length}
                            page={page}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={
                                handleChangeRowsPerPage
                            }
                            rowsPerPageOptions={[5, 10, 25]}
                        />
                    </TableContainer>
                </Box>
            </Box>

            <Dialog
                open={openForm}
                onClose={handleCloseForm}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingId
                        ? "Edit Membership"
                        : "Add Membership"}

                    <IconButton
                        onClick={handleCloseForm}
                        disabled={isSaving}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >
                    <DialogContent dividers>
                        <Stack spacing={2.5}>
                            <TextField
                                select
                                label="Select Member"
                                name="member_id"
                                value={formData.member_id}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                error={Boolean(formErrors.member_id)}
                                helperText={formErrors.member_id}
                            >
                                {members.map((member) => (
                                    <MenuItem
                                        key={member.id}
                                        value={String(member.id)}
                                    >
                                        {member.name} (ID: {member.id})
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Select Membership Plan"
                                name="plan_id"
                                value={formData.plan_id}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                error={Boolean(formErrors.plan_id)}
                                helperText={formErrors.plan_id}
                            >
                                {plans.map((plan) => (
                                    <MenuItem
                                        key={plan.id}
                                        value={String(plan.id)}
                                    >
                                        {plan.name} — ₹{plan.price} (
                                        {plan.duration_months} months)
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Start Date"
                                name="start_date"
                                type="date"
                                value={formData.start_date}
                                onChange={handleFormChange}
                                fullWidth
                                required
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                error={Boolean(formErrors.start_date)}
                                helperText={formErrors.start_date}
                            />

                            <TextField
                                label="Calculated End Date"
                                value={
                                    calculatedEndDate
                                        ? formatDate(calculatedEndDate)
                                        : ""
                                }
                                fullWidth
                                slotProps={{
                                    input: {
                                        readOnly: true,
                                    },
                                }}
                                helperText="Calculated using the selected plan duration."
                            />

                            {selectedPlanDetails && (
                                <Alert severity="info">
                                    Plan price: ₹
                                    {selectedPlanDetails.price}
                                </Alert>
                            )}

                            {members.length === 0 && (
                                <Alert severity="warning">
                                    No members are available. Add a member
                                    before creating a membership.
                                </Alert>
                            )}

                            {plans.length === 0 && (
                                <Alert severity="warning">
                                    No membership plans are available.
                                    Create a plan before assigning a
                                    membership.
                                </Alert>
                            )}
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={handleCloseForm}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={
                                isSaving ||
                                members.length === 0 ||
                                plans.length === 0
                            }
                        >
                            {isSaving ? (
                                <CircularProgress size={22} />
                            ) : editingId ? (
                                "Update Membership"
                            ) : (
                                "Create Membership"
                            )}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={openView}
                onClose={() => setOpenView(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Membership Details

                    <IconButton
                        onClick={() => setOpenView(false)}
                        sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                        }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {selectedMembership && (
                        <Stack spacing={2}>
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Member ID
                                </Typography>

                                <Typography fontWeight={500}>
                                    {selectedMembership.member_id ?? "—"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Member Name
                                </Typography>

                                <Typography fontWeight={500}>
                                    {getMemberName(selectedMembership)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Membership Plan
                                </Typography>

                                <Typography fontWeight={500}>
                                    {getPlanName(selectedMembership)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Start Date
                                </Typography>

                                <Typography fontWeight={500}>
                                    {formatDate(
                                        selectedMembership.start_date
                                    )}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    End Date
                                </Typography>

                                <Typography fontWeight={500}>
                                    {formatDate(viewEndDate)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Membership Status
                                </Typography>

                                <Chip
                                    label={
                                        viewEndDate &&
                                        new Date(
                                            `${getDateInputValue(viewEndDate)}T00:00:00`
                                        ) <
                                            new Date(
                                                `${new Date().toLocaleDateString("en-CA")}T00:00:00`
                                            )
                                            ? "Expired"
                                            : "Active"
                                    }
                                    color={
                                        viewEndDate &&
                                        new Date(
                                            `${getDateInputValue(viewEndDate)}T00:00:00`
                                        ) <
                                            new Date(
                                                `${new Date().toLocaleDateString("en-CA")}T00:00:00`
                                            )
                                            ? "error"
                                            : "success"
                                    }
                                    size="small"
                                />
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => setOpenView(false)}
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDelete}
                onClose={() => setOpenDelete(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Membership</DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this membership?
                        This action cannot be undone.
                    </Typography>

                    {selectedMembership && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 2 }}
                        >
                            Member:{" "}
                            {getMemberName(selectedMembership)}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setOpenDelete(false)}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Memberships;