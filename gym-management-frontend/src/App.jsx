import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MembershipPlans from "./pages/MembershipPlans";
import Memberships from "./pages/Memberships";
import Payments from "./pages/Payments";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/membership-plans" element={<MembershipPlans />} />
                <Route path="/memberships" element={<Memberships />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/register" element={<Register />} />
                <Route path="Profile" element={<Profile />}/>
            </Routes>
        </BrowserRouter>
    );
};

export default App;