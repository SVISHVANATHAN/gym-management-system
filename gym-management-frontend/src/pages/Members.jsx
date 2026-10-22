import {
    Box,
    Typography,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    Snackbar,
    Alert,
    Grid,
    InputAdornment,
    IconButton,
    TablePagination,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Members = () => {
    const [members, setMembers] = useState([]);

    const [openDialog, setOpenDialog] = useState(false);
    const [openDialogView, setOpenDialogView] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [selectedMember, setSelectedMember] = useState(null);

    const [viewLoading, setViewLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [address, setAddress] = useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [genderError, setGenderError] = useState("");
    const [dateOfBirthError, setDateOfBirthError] = useState("");

    const [editNameError, setEditNameError] = useState("");
    const [editEmailError, setEditEmailError] = useState("");
    const [editPhoneError, setEditPhoneError] = useState("");
    const [editGenderError, setEditGenderError] = useState("");
    const [editDateOfBirthError, setEditDateOfBirthError] = useState("");

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [viewError, setViewError] = useState("");
    const [editError, setEditError] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [genderFilter, setGenderFilter] = useState("all");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const validateForm = () => {
        let isValid = true;

        setNameError("");
        setEmailError("");
        setPhoneError("");
        setGenderError("");
        setDateOfBirthError("");

        if (!name.trim()) {
            setNameError("Name is required");
            isValid = false;
        } else if (name.trim().length < 3) {
            setNameError("Name must be at least 3 characters");
            isValid = false;
        }

        if (!email.trim()) {
            setEmailError("Email is required");
            isValid = false;
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            setEmailError("Invalid email format");
            isValid = false;
        }

        if (!phone.trim()) {
            setPhoneError("Phone number is required");
            isValid = false;
        } else if (!/^\d{10}$/.test(phone.trim())) {
            setPhoneError("Phone number must be exactly 10 digits");
            isValid = false;
        }

        if (!gender) {
            setGenderError("Gender is required");
            isValid = false;
        }

        if (!dateOfBirth) {
            setDateOfBirthError("Date of birth is required");
            isValid = false;
        }

        return isValid;
    };

    const validateEditForm = () => {
        let isValid = true;

        setEditNameError("");
        setEditEmailError("");
        setEditPhoneError("");
        setEditGenderError("");
        setEditDateOfBirthError("");

        if (!selectedMember?.name?.trim()) {
            setEditNameError("Name is required");
            isValid = false;
        } else if (selectedMember.name.trim().length < 3) {
            setEditNameError("Name must be at least 3 characters");
            isValid = false;
        }

        if (!selectedMember?.email?.trim()) {
            setEditEmailError("Email is required");
            isValid = false;
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                selectedMember.email.trim()
            )
        ) {
            setEditEmailError("Invalid email format");
            isValid = false;
        }

        if (!selectedMember?.phone?.trim()) {
            setEditPhoneError("Phone number is required");
            isValid = false;
        } else if (
            !/^\d{10}$/.test(selectedMember.phone.trim())
        ) {
            setEditPhoneError(
                "Phone number must be exactly 10 digits"
            );
            isValid = false;
        }

        if (!selectedMember?.gender) {
            setEditGenderError("Gender is required");
            isValid = false;
        }

        if (!selectedMember?.date_of_birth) {
            setEditDateOfBirthError(
                "Date of birth is required"
            );
            isValid = false;
        }

        return isValid;
    };

    const clearForm = () => {
        setName("");
        setEmail("");
        setPhone("");
        setGender("");
        setDateOfBirth("");
        setAddress("");

        setNameError("");
        setEmailError("");
        setPhoneError("");
        setGenderError("");
        setDateOfBirthError("");
    };

    const clearEditErrors = () => {
        setEditNameError("");
        setEditEmailError("");
        setEditPhoneError("");
        setEditGenderError("");
        setEditDateOfBirthError("");
        setEditError("");
    };

    const fetchMembers = async () => {
        try {
            setIsLoading(true);
            setErrorMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                setErrorMessage("You are not logged in.");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/members",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMembers(response.data.data || []);
        } catch (error) {
            console.error("Members fetch error:", error);

            setErrorMessage(
                error.response?.data?.message ||
                    "Failed to load members."
            );
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const handleCreateMember = async () => {
        setErrorMessage("");

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setErrorMessage("You are not logged in.");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/member",
                {
                    name: name.trim(),
                    email: email.trim(),
                    phone: phone.trim(),
                    gender,
                    date_of_birth: dateOfBirth,
                    address: address.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const newMember = response.data.data;

            setMembers((prevMembers) => [
                ...prevMembers,
                newMember,
            ]);

            setSuccessMessage(
                "Member created successfully!"
            );

            clearForm();
            setOpenDialog(false);
            setPage(0);
        } catch (error) {
            console.error(
                "Create member error:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                    "Something went wrong. Please try again."
            );
        }
    };

    const handleViewMember = async (id) => {
        setViewError("");
        setSelectedMember(null);
        setViewLoading(true);
        setOpenDialogView(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setViewError("You are not logged in.");
                return;
            }

            const response = await axios.get(
                `http://localhost:5000/api/member/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const member = response.data.data;

            setSelectedMember({
                ...member,
                date_of_birth: member.date_of_birth
                    ? String(member.date_of_birth).split("T")[0]
                    : "",
            });
        } catch (error) {
            console.error(
                "View member error:",
                error
            );

            setViewError(
                error.response?.data?.message ||
                    "Failed to load member details."
            );
        } finally {
            setViewLoading(false);
        }
    };

    const handleEditMember = (member) => {
        setEditError("");
        clearEditErrors();

        setSelectedMember({
            ...member,
            date_of_birth: member.date_of_birth
                ? String(member.date_of_birth).split("T")[0]
                : "",
        });

        setOpenEditDialog(true);
    };

    const handleUpdateMember = async () => {
        setEditError("");

        const isValid = validateEditForm();

        if (!isValid) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setEditError("You are not logged in.");
                return;
            }

            setIsUpdating(true);

            const response = await axios.patch(
                `http://localhost:5000/api/member/${selectedMember.id}`,
                {
                    name: selectedMember.name.trim(),
                    email: selectedMember.email.trim(),
                    phone: selectedMember.phone.trim(),
                    gender: selectedMember.gender,
                    date_of_birth:
                        selectedMember.date_of_birth,
                    address:
                        selectedMember.address?.trim() || "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const updatedMember =
                response.data.data || selectedMember;

            setMembers((prevMembers) =>
                prevMembers.map((member) =>
                    member.id === updatedMember.id
                        ? updatedMember
                        : member
                )
            );

            setSuccessMessage(
                "Member updated successfully!"
            );

            setOpenEditDialog(false);
            setSelectedMember(null);
            clearEditErrors();
        } catch (error) {
            console.error(
                "Update member error:",
                error
            );

            setEditError(
                error.response?.data?.message ||
                    "Failed to update member. Please try again."
            );
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteMember = (member) => {
        setSelectedMember(member);
        setDeleteError("");
        setOpenDeleteDialog(true);
    };

    const confirmDeleteMember = async () => {
        setDeleteError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setDeleteError("You are not logged in.");
                return;
            }

            setIsDeleting(true);

            await axios.delete(
                `http://localhost:5000/api/member/${selectedMember.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setMembers((prevMembers) =>
                prevMembers.filter(
                    (member) =>
                        member.id !== selectedMember.id
                )
            );

            setSuccessMessage(
                "Member deleted successfully!"
            );

            setOpenDeleteDialog(false);
            setSelectedMember(null);

            if (
                filteredMembers.length - 1 <=
                    page * rowsPerPage &&
                page > 0
            ) {
                setPage(page - 1);
            }
        } catch (error) {
            console.error(
                "Delete member error:",
                error
            );

            setDeleteError(
                error.response?.data?.message ||
                    "Failed to delete member. Please try again."
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredMembers = useMemo(() => {
        return members.filter((member) => {
            const search = searchTerm
                .trim()
                .toLowerCase();

            const matchesSearch =
                !search ||
                member.name
                    ?.toLowerCase()
                    .includes(search) ||
                member.email
                    ?.toLowerCase()
                    .includes(search) ||
                member.phone
                    ?.toLowerCase()
                    .includes(search);

            const matchesGender =
                genderFilter === "all" ||
                member.gender === genderFilter;

            return (
                matchesSearch &&
                matchesGender
            );
        });
    }, [members, searchTerm, genderFilter]);

    const paginatedMembers = filteredMembers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0);
    };

    const handleGenderFilterChange = (event) => {
        setGenderFilter(event.target.value);
        setPage(0);
    };

    const handleChangePage = (
        event,
        newPage
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(
            parseInt(event.target.value, 10)
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

                <Box
                    sx={{
                        padding: {
                            xs: 2,
                            sm: 3,
                            md: 4,
                        },
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems: {
                                xs: "flex-start",
                                sm: "center",
                            },
                            flexDirection: {
                                xs: "column",
                                sm: "row",
                            },
                            marginBottom: 1,
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 600,
                                }}
                            >
                                Members
                            </Typography>

                            <Typography
                                variant="body2"
                                sx={{
                                    color: "#6B7280",
                                    marginTop: 0.5,
                                }}
                            >
                                Manage your gym members
                            </Typography>
                        </Box>

                        <Button
                            variant="contained"
                            sx={{
                                textTransform: "none",
                            }}
                            onClick={() => {
                                clearForm();
                                setErrorMessage("");
                                setOpenDialog(true);
                            }}
                        >
                            + Add Member
                        </Button>
                    </Box>

                    {errorMessage && (
                        <Alert
                            severity="error"
                            sx={{
                                marginTop: 3,
                                marginBottom: 2,
                            }}
                            onClose={() =>
                                setErrorMessage("")
                            }
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    <Paper
                        sx={{
                            marginTop: 3,
                            marginBottom: 2,
                            padding: 2,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                flexDirection: {
                                    xs: "column",
                                    sm: "row",
                                },
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by name, email or phone"
                                value={searchTerm}
                                onChange={
                                    handleSearchChange
                                }
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
                                        sm: 180,
                                    },
                                }}
                            >
                                <InputLabel>
                                    Gender
                                </InputLabel>

                                <Select
                                    label="Gender"
                                    value={genderFilter}
                                    onChange={
                                        handleGenderFilterChange
                                    }
                                >
                                    <MenuItem value="all">
                                        All
                                    </MenuItem>

                                    <MenuItem value="male">
                                        Male
                                    </MenuItem>

                                    <MenuItem value="female">
                                        Female
                                    </MenuItem>

                                    <MenuItem value="other">
                                        Other
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <IconButton
                                onClick={fetchMembers}
                                disabled={isLoading}
                                sx={{
                                    border: "1px solid #D1D5DB",
                                    borderRadius: 1,
                                }}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Box>
                    </Paper>

                    <Paper
                        sx={{
                            overflowX: "auto",
                        }}
                    >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Roll No.
                                    </TableCell>

                                    <TableCell>
                                        Name
                                    </TableCell>

                                    <TableCell>
                                        Email
                                    </TableCell>

                                    <TableCell>
                                        Phone
                                    </TableCell>

                                    <TableCell>
                                        Gender
                                    </TableCell>

                                    <TableCell>
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
                                            sx={{
                                                padding: 5,
                                            }}
                                        >
                                            <Typography>
                                                Loading members...
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedMembers.length ===
                                  0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{
                                                padding: 5,
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {members.length ===
                                                0
                                                    ? "No members found"
                                                    : "No members match your search"}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: "#6B7280",
                                                    marginTop: 1,
                                                }}
                                            >
                                                {members.length ===
                                                0
                                                    ? "Add your first member to get started."
                                                    : "Try changing your search or filter."}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedMembers.map(
                                        (
                                            member,
                                            index
                                        ) => (
                                            <TableRow
                                                key={
                                                    member.id
                                                }
                                                hover
                                            >
                                                <TableCell>
                                                    {page *
                                                        rowsPerPage +
                                                        index +
                                                        1}
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        member.name
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        member.email
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    {
                                                        member.phone
                                                    }
                                                </TableCell>

                                                <TableCell
                                                    sx={{
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {
                                                        member.gender
                                                    }
                                                </TableCell>

                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            title="View member"
                                                            aria-label={`View ${member.name}`}
                                                            onClick={() => handleViewMember(member.id)}
                                                            sx={{
                                                                color: "#1976D2",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(25, 118, 210, 0.08)",
                                                                },
                                                            }}
                                                        >
                                                            <VisibilityIcon fontSize="small" />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            title="Edit member"
                                                            aria-label={`Edit ${member.name}`}
                                                            onClick={() => handleEditMember(member)}
                                                            sx={{
                                                                color: "#2E7D32",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(46, 125, 50, 0.08)",
                                                                },
                                                            }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            title="Delete member"
                                                            aria-label={`Delete ${member.name}`}
                                                            onClick={() => handleDeleteMember(member)}
                                                            sx={{
                                                                color: "#D32F2F",
                                                                "&:hover": {
                                                                    backgroundColor: "rgba(211, 47, 47, 0.08)",
                                                                },
                                                            }}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )
                                )}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={
                                filteredMembers.length
                            }
                            page={page}
                            onPageChange={
                                handleChangePage
                            }
                            rowsPerPage={
                                rowsPerPage
                            }
                            onRowsPerPageChange={
                                handleChangeRowsPerPage
                            }
                            rowsPerPageOptions={[
                                5,
                                10,
                                25,
                            ]}
                        />
                    </Paper>

                    <Dialog
                        open={openDialog}
                        onClose={() => {
                            clearForm();
                            setErrorMessage("");
                            setOpenDialog(false);
                        }}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>
                            Add New Member
                        </DialogTitle>

                        <DialogContent>
                            {errorMessage && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        marginBottom: 2,
                                    }}
                                    onClose={() =>
                                        setErrorMessage("")
                                    }
                                >
                                    {errorMessage}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Name"
                                margin="normal"
                                value={name}
                                onChange={(e) => {
                                    setName(
                                        e.target.value
                                    );
                                    setNameError("");
                                    setErrorMessage("");
                                }}
                                error={Boolean(
                                    nameError
                                )}
                                helperText={
                                    nameError
                                }
                            />

                            <TextField
                                fullWidth
                                label="Email"
                                margin="normal"
                                value={email}
                                onChange={(e) => {
                                    setEmail(
                                        e.target.value
                                    );
                                    setEmailError("");
                                    setErrorMessage("");
                                }}
                                error={Boolean(
                                    emailError
                                )}
                                helperText={
                                    emailError
                                }
                            />

                            <TextField
                                fullWidth
                                label="Phone"
                                margin="normal"
                                value={phone}
                                onChange={(e) => {
                                    setPhone(
                                        e.target.value
                                    );
                                    setPhoneError("");
                                    setErrorMessage("");
                                }}
                                error={Boolean(
                                    phoneError
                                )}
                                helperText={
                                    phoneError
                                }
                            />

                            <FormControl
                                fullWidth
                                margin="normal"
                                error={Boolean(
                                    genderError
                                )}
                            >
                                <InputLabel>
                                    Gender
                                </InputLabel>

                                <Select
                                    label="Gender"
                                    value={gender}
                                    onChange={(e) => {
                                        setGender(
                                            e.target.value
                                        );
                                        setGenderError(
                                            ""
                                        );
                                        setErrorMessage(
                                            ""
                                        );
                                    }}
                                >
                                    <MenuItem value="male">
                                        Male
                                    </MenuItem>

                                    <MenuItem value="female">
                                        Female
                                    </MenuItem>

                                    <MenuItem value="other">
                                        Other
                                    </MenuItem>
                                </Select>

                                <FormHelperText>
                                    {
                                        genderError
                                    }
                                </FormHelperText>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                margin="normal"
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                value={
                                    dateOfBirth
                                }
                                onChange={(e) => {
                                    setDateOfBirth(
                                        e.target.value
                                    );
                                    setDateOfBirthError(
                                        ""
                                    );
                                    setErrorMessage(
                                        ""
                                    );
                                }}
                                error={Boolean(
                                    dateOfBirthError
                                )}
                                helperText={
                                    dateOfBirthError
                                }
                            />

                            <TextField
                                fullWidth
                                label="Address"
                                margin="normal"
                                multiline
                                rows={3}
                                value={address}
                                onChange={(e) => {
                                    setAddress(
                                        e.target.value
                                    );
                                    setErrorMessage("");
                                }}
                            />
                        </DialogContent>

                        <DialogActions>
                            <Button
                                onClick={() => {
                                    clearForm();
                                    setErrorMessage(
                                        ""
                                    );
                                    setOpenDialog(false);
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={
                                    handleCreateMember
                                }
                            >
                                Create Member
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={openDialogView}
                        onClose={() => {
                            setOpenDialogView(false);
                            setSelectedMember(null);
                            setViewError("");
                        }}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>
                            Member Details
                        </DialogTitle>

                        <DialogContent dividers>
                            {viewError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        marginBottom: 2,
                                    }}
                                    onClose={() =>
                                        setViewError(
                                            ""
                                        )
                                    }
                                >
                                    {viewError}
                                </Alert>
                            )}

                            {viewLoading && (
                                <Typography
                                    sx={{
                                        textAlign:
                                            "center",
                                        padding: 3,
                                    }}
                                >
                                    Loading member
                                    details...
                                </Typography>
                            )}

                            {!viewLoading &&
                                selectedMember && (
                                    <Grid
                                        container
                                        spacing={2}
                                    >
                                        <Grid size={4}>
                                            <Typography color="text.secondary">
                                                Name
                                            </Typography>
                                        </Grid>

                                        <Grid size={8}>
                                            <Typography>
                                                {
                                                    selectedMember.name
                                                }
                                            </Typography>
                                        </Grid>

                                        <Grid size={4}>
                                            <Typography color="text.secondary">
                                                Email
                                            </Typography>
                                        </Grid>

                                        <Grid size={8}>
                                            <Typography>
                                                {
                                                    selectedMember.email
                                                }
                                            </Typography>
                                        </Grid>

                                        <Grid size={4}>
                                            <Typography color="text.secondary">
                                                Phone
                                            </Typography>
                                        </Grid>

                                        <Grid size={8}>
                                            <Typography>
                                                {
                                                    selectedMember.phone
                                                }
                                            </Typography>
                                        </Grid>

                                        <Grid size={4}>
                                            <Typography color="text.secondary">
                                                Gender
                                            </Typography>
                                        </Grid>

                                        <Grid size={8}>
                                            <Typography
                                                sx={{
                                                    textTransform:
                                                        "capitalize",
                                                }}
                                            >
                                                {
                                                    selectedMember.gender
                                                }
                                            </Typography>
                                        </Grid>

                                        <Grid size={4}>
                                            <Typography color="text.secondary">
                                                Date of Birth
                                            </Typography>
                                        </Grid>

                                        <Grid size={8}>
                                            <Typography>
                                                {
                                                    selectedMember.date_of_birth ||
                                                    "Not provided"
                                                }
                                            </Typography>
                                        </Grid>

                                        <Grid size={4}>
                                            <Typography color="text.secondary">
                                                Address
                                            </Typography>
                                        </Grid>

                                        <Grid size={8}>
                                            <Typography>
                                                {
                                                    selectedMember.address ||
                                                    "Not provided"
                                                }
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                )}
                        </DialogContent>

                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setOpenDialogView(
                                        false
                                    );
                                    setSelectedMember(
                                        null
                                    );
                                    setViewError("");
                                }}
                            >
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={openEditDialog}
                        onClose={() => {
                            if (!isUpdating) {
                                setOpenEditDialog(
                                    false
                                );
                                setSelectedMember(
                                    null
                                );
                                clearEditErrors();
                            }
                        }}
                        fullWidth
                        maxWidth="sm"
                    >
                        <DialogTitle>
                            Edit Member
                        </DialogTitle>

                        <DialogContent>
                            {editError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        marginTop: 1,
                                        marginBottom: 1,
                                    }}
                                    onClose={() =>
                                        setEditError(
                                            ""
                                        )
                                    }
                                >
                                    {editError}
                                </Alert>
                            )}

                            <TextField
                                fullWidth
                                label="Name"
                                margin="normal"
                                value={
                                    selectedMember?.name ||
                                    ""
                                }
                                onChange={(e) => {
                                    setSelectedMember({
                                        ...selectedMember,
                                        name: e.target.value,
                                    });
                                    setEditNameError(
                                        ""
                                    );
                                    setEditError("");
                                }}
                                error={Boolean(
                                    editNameError
                                )}
                                helperText={
                                    editNameError
                                }
                            />

                            <TextField
                                fullWidth
                                label="Email"
                                margin="normal"
                                value={
                                    selectedMember?.email ||
                                    ""
                                }
                                onChange={(e) => {
                                    setSelectedMember({
                                        ...selectedMember,
                                        email: e.target.value,
                                    });
                                    setEditEmailError(
                                        ""
                                    );
                                    setEditError("");
                                }}
                                error={Boolean(
                                    editEmailError
                                )}
                                helperText={
                                    editEmailError
                                }
                            />

                            <TextField
                                fullWidth
                                label="Phone"
                                margin="normal"
                                value={
                                    selectedMember?.phone ||
                                    ""
                                }
                                onChange={(e) => {
                                    setSelectedMember({
                                        ...selectedMember,
                                        phone: e.target.value,
                                    });
                                    setEditPhoneError(
                                        ""
                                    );
                                    setEditError("");
                                }}
                                error={Boolean(
                                    editPhoneError
                                )}
                                helperText={
                                    editPhoneError
                                }
                            />

                            <FormControl
                                fullWidth
                                margin="normal"
                                error={Boolean(
                                    editGenderError
                                )}
                            >
                                <InputLabel>
                                    Gender
                                </InputLabel>

                                <Select
                                    label="Gender"
                                    value={
                                        selectedMember?.gender ||
                                        ""
                                    }
                                    onChange={(e) => {
                                        setSelectedMember({
                                            ...selectedMember,
                                            gender: e.target
                                                .value,
                                        });
                                        setEditGenderError(
                                            ""
                                        );
                                        setEditError("");
                                    }}
                                >
                                    <MenuItem value="male">
                                        Male
                                    </MenuItem>

                                    <MenuItem value="female">
                                        Female
                                    </MenuItem>

                                    <MenuItem value="other">
                                        Other
                                    </MenuItem>
                                </Select>

                                <FormHelperText>
                                    {
                                        editGenderError
                                    }
                                </FormHelperText>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Date of Birth"
                                type="date"
                                margin="normal"
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                                value={
                                    selectedMember?.date_of_birth ||
                                    ""
                                }
                                onChange={(e) => {
                                    setSelectedMember({
                                        ...selectedMember,
                                        date_of_birth:
                                            e.target.value,
                                    });
                                    setEditDateOfBirthError(
                                        ""
                                    );
                                    setEditError("");
                                }}
                                error={Boolean(
                                    editDateOfBirthError
                                )}
                                helperText={
                                    editDateOfBirthError
                                }
                            />

                            <TextField
                                fullWidth
                                label="Address"
                                margin="normal"
                                multiline
                                rows={3}
                                value={
                                    selectedMember?.address ||
                                    ""
                                }
                                onChange={(e) => {
                                    setSelectedMember({
                                        ...selectedMember,
                                        address: e.target.value,
                                    });
                                    setEditError("");
                                }}
                            />
                        </DialogContent>

                        <DialogActions>
                            <Button
                                disabled={isUpdating}
                                onClick={() => {
                                    setOpenEditDialog(
                                        false
                                    );
                                    setSelectedMember(
                                        null
                                    );
                                    clearEditErrors();
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                disabled={
                                    isUpdating ||
                                    !selectedMember
                                }
                                onClick={
                                    handleUpdateMember
                                }
                            >
                                {isUpdating
                                    ? "Updating..."
                                    : "Update Member"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog
                        open={openDeleteDialog}
                        onClose={() => {
                            if (!isDeleting) {
                                setOpenDeleteDialog(
                                    false
                                );
                                setSelectedMember(
                                    null
                                );
                                setDeleteError("");
                            }
                        }}
                        fullWidth
                        maxWidth="xs"
                    >
                        <DialogTitle>
                            Delete Member
                        </DialogTitle>

                        <DialogContent>
                            {deleteError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        marginBottom: 2,
                                    }}
                                    onClose={() =>
                                        setDeleteError(
                                            ""
                                        )
                                    }
                                >
                                    {deleteError}
                                </Alert>
                            )}

                            <Typography>
                                Are you sure you want
                                to delete{" "}
                                <strong>
                                    {
                                        selectedMember?.name
                                    }
                                </strong>
                                ?
                            </Typography>
                        </DialogContent>

                        <DialogActions>
                            <Button
                                disabled={isDeleting}
                                onClick={() => {
                                    setOpenDeleteDialog(
                                        false
                                    );
                                    setSelectedMember(
                                        null
                                    );
                                    setDeleteError("");
                                }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                disabled={
                                    isDeleting ||
                                    !selectedMember
                                }
                                onClick={
                                    confirmDeleteMember
                                }
                            >
                                {isDeleting
                                    ? "Deleting..."
                                    : "Delete"}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Box>

            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={3000}
                onClose={() =>
                    setSuccessMessage("")
                }
            >
                <Alert
                    severity="success"
                    onClose={() =>
                        setSuccessMessage("")
                    }
                    sx={{
                        width: "100%",
                    }}
                >
                    {successMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Members;