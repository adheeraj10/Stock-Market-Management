import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@material-tailwind/react";
import LandingPage from "./Components/LandingPage/LandingPage";
import Login from "./Components/Login/Login";
import Signup from "./Components/Signup/signup";
import Home from "./Pages/Home";
import Funds from "./Pages/Funds";
import Porfolio from "./Pages/Portfolio";
import Trade from "./Pages/Trade";
import Chatbot from "./Pages/chatbot.jsx";
import AdminLogin from "./Pages/AdminLogin";
import "./App.css";
import Admin from "./Pages/Admin.jsx";
// import { Home } from '@mui/icons-material';

const theme = {
  button: {
    defaultProps: {
      variant: "filled",
      size: "md",
      color: "blue",
      fullWidth: false,
      ripple: true,
    },
    styles: {
      base: {
        initial: {
          textTransform: "normal",
        },
      },
    },
  },
  navbar: {
    defaultProps: {
      variant: "filled",
      color: "white",
      shadow: true,
      blurred: false,
      fullWidth: false,
      pinned: false,
    },
    styles: {
      base: {
        initial: {
          display: "block",
          width: "w-full",
          maxWidth: "max-w-screen-2xl",
          borderRadius: "rounded-xl",
          py: "py-4",
          px: "px-8",
        },
      },
    },
  },
};

function App() {
  return (
    <ThemeProvider value={theme}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/home" element={<Home />} />
            <Route path="/funds" element={<Funds />} />
            <Route path="/portfolio" element={<Porfolio />} />
            <Route path="/trade" element={<Trade />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
