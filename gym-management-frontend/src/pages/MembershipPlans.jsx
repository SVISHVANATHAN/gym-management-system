import {
    Box,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TablePagination,
    Snackbar,
    Alert,
    CircularProgress,
    Stack,
    Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/membership-plans";

const MembershipPlans = () => {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [formError, setFormError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [durationFilter, setDurationFilter] = useState("all");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [dialogMode, setDialogMode] = useState("create");
    const [selectedPlan, setSelectedPlan] = useState(null);

    const [name, setName] = useState("");
    const [durationMonths, setDurationMonths] = useState("");
    const [price, setPrice] = useState("");

    const [nameError, setNameError] = useState("");
    const [durationError, setDurationError] = useState("");
    const [priceError, setPriceError] = useState("");

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const getToken = () => {
        return localStorage.getItem("token");
    };

    const getHeaders = () => {
        const token = getToken();

        if (!token) {
            throw new Error("You are not logged in.");
        }

        return {
            Authorization: `Bearer ${token}`,
        };
    };

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setSnackbar((previous) => ({
            ...previous,
            open: false,
        }));
    };

    const fetchPlans = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const response = await axios.get(API_URL, {
                headers: getHeaders(),
            });

            setPlans(
                Array.isArray(response.data.data)
                    ? response.data.data
                    : []
            );
        } catch (error) {
            console.error(
                "Fetch membership plans error:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to load membership plans."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const search = searchTerm.trim().toLowerCase();

            const matchesSearch =
                !search ||
                String(plan.name || "")
                    .toLowerCase()
                    .includes(search);

            const matchesDuration =
                durationFilter === "all" ||
                String(plan.duration_months) === durationFilter;

            return matchesSearch && matchesDuration;
        });
    }, [plans, searchTerm, durationFilter]);

    const paginatedPlans = filteredPlans.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const durationOptions = useMemo(() => {
        return [
            ...new Set(
                plans
                    .map((plan) =>
                        String(plan.duration_months)
                    )
                    .filter((duration) => duration !== "undefined")
            ),
        ].sort((a, b) => Number(a) - Number(b));
    }, [plans]);

    const clearForm = () => {
        setName("");
        setDurationMonths("");
        setPrice("");

        setNameError("");
        setDurationError("");
        setPriceError("");
        setFormError("");
    };

    const validateForm = () => {
        setNameError("");
        setDurationError("");
        setPriceError("");

        let isValid = true;

        if (!name.trim()) {
            setNameError("Plan name is required.");
            isValid = false;
        } else if (name.trim().length < 3) {
            setNameError(
                "Plan name must contain at least 3 characters."
            );
            isValid = false;
        }

        if (
            durationMonths === "" ||
            !Number.isInteger(Number(durationMonths)) ||
            Number(durationMonths) <= 0
        ) {
            setDurationError(
                "Enter a valid duration in months."
            );
            isValid = false;
        }

        if (
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            setPriceError("Enter a valid price greater than zero.");
            isValid = false;
        }

        return isValid;
    };

    const handleOpenCreate = () => {
        clearForm();
        setDialogMode("create");
        setSelectedPlan(null);
        setOpenFormDialog(true);
    };

    const handleOpenEdit = (plan) => {
        clearForm();

        setDialogMode("edit");
        setSelectedPlan(plan);

        setName(plan.name || "");
        setDurationMonths(
            plan.duration_months ?? ""
        );
        setPrice(plan.price ?? "");

        setOpenFormDialog(true);
    };

    const handleCloseForm = () => {
        if (isSaving) {
            return;
        }

        setOpenFormDialog(false);
        setSelectedPlan(null);
        clearForm();
    };

    const handleSavePlan = async (event) => {
        event.preventDefault();

        setFormError("");

        if (!validateForm()) {
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                name: name.trim(),
                duration_months: Number(durationMonths),
                price: Number(price),
            };

            const headers = getHeaders();

            if (dialogMode === "create") {
                await axios.post(API_URL, payload, {
                    headers,
                });

                showSnackbar(
                    "Membership plan created successfully!"
                );
            } else {
                await axios.patch(
                    `${API_URL}/${selectedPlan.id}`,
                    payload,
                    { headers }
                );

                showSnackbar(
                    "Membership plan updated successfully!"
                );
            }

            setOpenFormDialog(false);
            setSelectedPlan(null);
            clearForm();

            await fetchPlans();
        } catch (error) {
            console.error(
                "Save membership plan error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to save membership plan."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleViewPlan = async (plan) => {
        setSelectedPlan(null);
        setViewLoading(true);
        setOpenViewDialog(true);

        try {
            const response = await axios.get(
                `${API_URL}/${plan.id}`,
                {
                    headers: getHeaders(),
                }
            );

            const result = response.data.data;

            const details = Array.isArray(result)
                ? result[0]
                : result;

            if (!details) {
                throw new Error(
                    "Membership plan details were not found."
                );
            }

            setSelectedPlan(details);
        } catch (error) {
            console.error(
                "View membership plan error:",
                error
            );

            setOpenViewDialog(false);

            showSnackbar(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to load plan details.",
                "error"
            );
        } finally {
            setViewLoading(false);
        }
    };

    const handleOpenDelete = (plan) => {
        setSelectedPlan(plan);
        setFormError("");
        setOpenDeleteDialog(true);
    };

    const handleDeletePlan = async () => {
        if (!selectedPlan) {
            return;
        }

        try {
            setIsDeleting(true);
            setFormError("");

            await axios.delete(
                `${API_URL}/${selectedPlan.id}`,
                {
                    headers: getHeaders(),
                }
            );

            setPlans((previousPlans) =>
                previousPlans.filter(
                    (plan) => plan.id !== selectedPlan.id
                )
            );

            setOpenDeleteDialog(false);
            setSelectedPlan(null);

            setPage((currentPage) => {
                const remainingCount = filteredPlans.length - 1;

                if (
                    currentPage > 0 &&
                    remainingCount <= currentPage * rowsPerPage
                ) {
                    return currentPage - 1;
                }

                return currentPage;
            });

            showSnackbar(
                "Membership plan deleted successfully!"
            );
        } catch (error) {
            console.error(
                "Delete membership plan error:",
                error
            );

            setFormError(
                error.response?.data?.message ||
                    error.message ||
                    "Failed to delete membership plan."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleDurationChange = (event) => {
        setDurationFilter(event.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(
            Number.parseInt(event.target.value, 10)
        );
        setPage(0);
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

            <Box
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                }}
            >
                <Navbar />

                <Box sx={{ p: 3 }}>
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                            sx={{
                                justifyContent: "space-between",
                                alignItems: {
                                xs: "stretch",
                                sm: "center",
                                },
                            }}
                        >
                        <Box>
                            <Typography
                                variant="h5"
                                sx={{ fontWeight: 600 }}
                            >
                                Membership Plans
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#6B7280",
                                    mt: 0.5,
                                }}
                            >
                                Manage your gym membership plans here.
                            </Typography>
                        </Box>

                        <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            justifyContent: "flex-end",
                        }}
                        >
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleOpenCreate}
                                sx={{
                                    backgroundColor: "#2563EB",
                                    textTransform: "none",
                                    borderRadius: 2,
                                    px: 2,
                                }}
                            >
                                Add Plan
                            </Button>
                        </Stack>
                    </Stack>

                    <Paper
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            boxShadow: 1,
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
                                placeholder="Search plans by name..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <FormControl
                                size="small"
                                sx={{
                                    minWidth: {
                                        xs: "100%",
                                        sm: 200,
                                    },
                                }}
                            >
                                <InputLabel>
                                    Duration
                                </InputLabel>

                                <Select
                                    value={durationFilter}
                                    label="Duration"
                                    onChange={handleDurationChange}
                                >
                                    <MenuItem value="all">
                                        All Durations
                                    </MenuItem>

                                    {durationOptions.map(
                                        (duration) => (
                                            <MenuItem
                                                key={duration}
                                                value={duration}
                                            >
                                                {duration}{" "}
                                                {duration === "1"
                                                    ? "Month"
                                                    : "Months"}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Paper>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{ mt: 2 }}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    
                                >
                                    Retry
                                </Button>
                            }
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    <TableContainer
                        component={Paper}
                        sx={{
                            mt: 3,
                            borderRadius: 2,
                            boxShadow: 1,
                            overflowX: "auto",
                        }}
                    >
                        <Table sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow
                                    sx={{
                                        backgroundColor: "#F9FAFB",
                                    }}
                                >
                                    <TableCell
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Plan Name
                                    </TableCell>

                                    <TableCell
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Duration
                                    </TableCell>

                                    <TableCell
                                        sx={{ fontWeight: 600 }}
                                    >
                                        Price
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
                                            colSpan={4}
                                            align="center"
                                            sx={{ py: 5 }}
                                        >
                                            <CircularProgress
                                                size={28}
                                            />

                                            <Typography
                                                variant="body2"
                                                sx={{ mt: 1 }}
                                            >
                                                Loading membership plans...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : errorMessage ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            align="center"
                                            sx={{ py: 4 }}
                                        >
                                            Unable to load membership plans.
                                        </TableCell>
                                    </TableRow>
                                ) : filteredPlans.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={4}
                                            align="center"
                                            sx={{
                                                py: 5,
                                                color: "#6B7280",
                                            }}
                                        >
                                            {plans.length === 0
                                                ? "No membership plans found. Add your first plan."
                                                : "No plans match your search or filter."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedPlans.map((plan) => (
                                        <TableRow
                                            key={plan.id}
                                            hover
                                        >
                                            <TableCell>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    {plan.name}
                                                </Typography>
                                            </TableCell>

                                            <TableCell>
                                                {plan.duration_months}{" "}
                                                {Number(
                                                    plan.duration_months
                                                ) === 1
                                                    ? "Month"
                                                    : "Months"}
                                            </TableCell>

                                            <TableCell>
                                                ₹
                                                {Number(
                                                    plan.price
                                                ).toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </TableCell>

                                            <TableCell align="center">
                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    sx={{
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <Tooltip title="View plan">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() =>
                                                                handleViewPlan(
                                                                    plan
                                                                )
                                                            }
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Edit plan">
                                                        <IconButton
                                                            size="small"
                                                            color="success"
                                                            onClick={() =>
                                                                handleOpenEdit(
                                                                    plan
                                                                )
                                                            }
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title="Delete plan">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() =>
                                                                handleOpenDelete(
                                                                    plan
                                                                )
                                                            }
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={filteredPlans.length}
                            page={Math.min(
                                page,
                                Math.max(
                                    0,
                                    Math.ceil(
                                        filteredPlans.length /
                                            rowsPerPage
                                    ) - 1
                                )
                            )}
                            onPageChange={handleChangePage}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={
                                handleChangeRowsPerPage
                            }
                            rowsPerPageOptions={[5, 10, 25]}
                            labelRowsPerPage="Plans per page:"
                        />
                    </TableContainer>
                </Box>
            </Box>

            <Dialog
                open={openFormDialog}
                onClose={handleCloseForm}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {dialogMode === "create"
                        ? "Add Membership Plan"
                        : "Edit Membership Plan"}
                </DialogTitle>

                <Box
                    component="form"
                    onSubmit={handleSavePlan}
                >
                    <DialogContent>
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            {formError && (
                                <Alert severity="error">
                                    {formError}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Plan Name"
                                value={name}
                                onChange={(event) => {
                                    setName(event.target.value);
                                    setNameError("");
                                    setFormError("");
                                }}
                                error={Boolean(nameError)}
                                helperText={nameError}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Duration in Months"
                                type="number"
                                value={durationMonths}
                                onChange={(event) => {
                                    setDurationMonths(
                                        event.target.value
                                    );
                                    setDurationError("");
                                    setFormError("");
                                }}
                                error={Boolean(durationError)}
                                helperText={durationError}
                                slotProps={{
                                    htmlInput: {
                                        min: 1,
                                        step: 1,
                                    },
                                }}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Price (₹)"
                                type="number"
                                value={price}
                                onChange={(event) => {
                                    setPrice(event.target.value);
                                    setPriceError("");
                                    setFormError("");
                                }}
                                error={Boolean(priceError)}
                                helperText={priceError}
                                slotProps={{
                                    htmlInput: {
                                        min: 0.01,
                                        step: 0.01,
                                    },
                                }}
                                required
                            />
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={handleCloseForm}
                            disabled={isSaving}
                            sx={{ textTransform: "none" }}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSaving}
                            sx={{ textTransform: "none" }}
                        >
                            {isSaving ? (
                                <CircularProgress
                                    size={22}
                                    color="inherit"
                                />
                            ) : dialogMode === "create" ? (
                                "Create Plan"
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Membership Plan Details
                </DialogTitle>

                <DialogContent dividers>
                    {viewLoading ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                py: 3,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : selectedPlan ? (
                        <Stack spacing={2}>
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Plan ID
                                </Typography>

                                <Typography fontWeight={500}>
                                    {selectedPlan.id}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Plan Name
                                </Typography>

                                <Typography fontWeight={500}>
                                    {selectedPlan.name}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Duration
                                </Typography>

                                <Typography fontWeight={500}>
                                    {selectedPlan.duration_months}{" "}
                                    {Number(
                                        selectedPlan.duration_months
                                    ) === 1
                                        ? "Month"
                                        : "Months"}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Price
                                </Typography>

                                <Typography fontWeight={500}>
                                    ₹
                                    {Number(
                                        selectedPlan.price
                                    ).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </Typography>
                            </Box>
                        </Stack>
                    ) : (
                        <Typography>
                            No plan details available.
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setOpenViewDialog(false)
                        }
                        sx={{ textTransform: "none" }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openDeleteDialog}
                onClose={() => {
                    if (!isDeleting) {
                        setOpenDeleteDialog(false);
                        setSelectedPlan(null);
                        setFormError("");
                    }
                }}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Delete Membership Plan
                </DialogTitle>

                <DialogContent>
                    {formError && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2 }}
                        >
                            {formError}
                        </Alert>
                    )}

                    <Typography>
                        Are you sure you want to delete{" "}
                        <strong>
                            {selectedPlan?.name}
                        </strong>
                        ?
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        This action cannot be undone. A backend
                        foreign-key constraint may prevent deletion
                        if the plan is already being used by memberships
                        .
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        disabled={isDeleting}
                        onClick={() => {
                            setOpenDeleteDialog(false);
                            setSelectedPlan(null);
                            setFormError("");
                        }}
                        sx={{ textTransform: "none" }}
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                        onClick={handleDeletePlan}
                        sx={{ textTransform: "none" }}
                    >
                        {isDeleting ? (
                            <CircularProgress
                                size={22}
                                color="inherit"
                            />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                }}
            >
                <Alert
                    onClose={handleSnackbarClose}
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

export default MembershipPlans;