import {
    Box,
    Typography,
    Paper,
    Avatar,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Snackbar,
} from "@mui/material";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const Profile = () => {
    const navigate = useNavigate();

    const [admin, setAdmin] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [nameError, setNameError] = useState("");
    const [emailError, setEmailError] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [serverError, setServerError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;



    useEffect(() => {
        const fetchAdmin = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token");

                if (!token) {
                    setServerError("Authentication token not found.");
                    return;
                }

                const decoded = jwtDecode(token);

                const response = await axios.get(
                    `http://localhost:5000/api/admin/${decoded.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const adminData = response.data.data[0];

                setAdmin(adminData);
                setName(adminData.name);
                setEmail(adminData.email);
            } catch (error) {
                console.error("Profile fetch error:", error);

                setServerError(
                    error.response?.data?.message ||
                        "Failed to load profile. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAdmin();
    }, []);



    const validateForm = () => {
        let isValid = true;

        setNameError("");
        setEmailError("");

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
        } else if (!emailRegex.test(email)) {
            setEmailError("Please enter a valid email address");
            isValid = false;
        }

        return isValid;
    };



    const handleSave = async () => {
        setServerError("");
        setSuccessMessage("");

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setServerError("Authentication token not found.");
                return;
            }

            const decoded = jwtDecode(token);

            const response = await axios.patch(
                `http://localhost:5000/api/admin/${decoded.id}`,
                {
                    name: name.trim(),
                    email: email.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(response.data);

            setAdmin({
                ...admin,
                name: name.trim(),
                email: email.trim(),
            });

            setName(name.trim());
            setEmail(email.trim());

            setIsEditing(false);

            setSuccessMessage("Profile updated successfully!");
        } catch (error) {
            console.error("Profile update error:", error);

            setServerError(
                error.response?.data?.message ||
                    "Failed to update profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };


    const handleCancel = () => {
        setName(admin.name);
        setEmail(admin.email);

        setNameError("");
        setEmailError("");
        setServerError("");

        setIsEditing(false);
    };



    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "100vh",
                    backgroundColor: "#F3F4F6",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }



    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#F3F4F6",
                padding: {
                    xs: 2,
                    sm: 3,
                    md: 4,
                },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >


            <Box
                sx={{
                    width: "100%",
                    maxWidth: 1000,
                    mb: 2,
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => navigate("/")}
                    sx={{
                        textTransform: "none",
                        fontSize: "0.95rem",
                    }}
                >
                    ← Back to Dashboard
                </Button>
            </Box>

            <Typography
                variant="h4"
                sx={{
                    fontWeight: 600,
                    mb: 3,
                    fontSize: {
                        xs: "1.8rem",
                        sm: "2.1rem",
                        md: "2.125rem",
                    },
                }}
            >
                My Profile
            </Typography>



            {serverError && (
                <Alert
                    severity="error"
                    sx={{
                        width: "100%",
                        maxWidth: 500,
                        mb: 2,
                    }}
                >
                    {serverError}
                </Alert>
            )}


            <Paper
                elevation={2}
                sx={{
                    padding: {
                        xs: 2.5,
                        sm: 4,
                    },
                    width: "100%",
                    maxWidth: 500,
                    textAlign: "center",
                    borderRadius: 2,
                }}
            >


                <Avatar
                    sx={{
                        width: 72,
                        height: 72,
                        margin: "0 auto",
                        bgcolor: "primary.main",
                        fontSize: "1.8rem",
                    }}
                >
                    {admin?.name?.charAt(0).toUpperCase()}
                </Avatar>



                {!isEditing ? (
                    <>
                        <Typography
                            variant="h6"
                            sx={{
                                mt: 2,
                                fontWeight: 600,
                            }}
                        >
                            {admin.name}
                        </Typography>

                        <Typography color="text.secondary">
                            {admin.email}
                        </Typography>
                    </>
                ) : (
                    <Box
                        sx={{
                            mt: 3,
                            width: "100%",
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setNameError("");
                                setServerError("");
                            }}
                            error={Boolean(nameError)}
                            helperText={nameError}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError("");
                                setServerError("");
                            }}
                            error={Boolean(emailError)}
                            helperText={emailError}
                        />
                    </Box>
                )}


                <Box
                    sx={{
                        marginTop: 4,
                        textAlign: "left",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 600,
                            marginBottom: 2,
                        }}
                    >
                        Profile Information
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Name
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            marginBottom: 2,
                            wordBreak: "break-word",
                        }}
                    >
                        {isEditing ? name : admin.name}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Email
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            wordBreak: "break-word",
                        }}
                    >
                        {isEditing ? email : admin.email}
                    </Typography>


                    {!isEditing ? (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                mt: 3,
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setIsEditing(true);
                                    setServerError("");
                                    setNameError("");
                                    setEmailError("");
                                }}
                            >
                                Edit Profile
                            </Button>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 2,
                                mt: 3,
                                flexWrap: "wrap",
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={handleCancel}
                                disabled={saving}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                            sx={{ mr: 1 }}
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    "Save"
                                )}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>



            <Snackbar
                open={Boolean(successMessage)}
                autoHideDuration={3000}
                onClose={() => setSuccessMessage("")}
                message={successMessage}
            />
        </Box>
    );
};

export default Profile;