import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
<<<<<<< HEAD
import { ProtectedRoute } from "./components/ProtectedRoute";
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import Dashboard from "./pages/Dashboard"; 

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Dashboard" element={<Dashboard />} /> 
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
        </Routes>
        </AuthProvider>
    </BrowserRouter>
  );
=======
import Register from "./pages/register";
import Login from "./pages/login";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/dashboard"
                        element={
                            <Dashboard />
                        }
                    />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
>>>>>>> b875560135807ec1f1d3262d567a02f90ebee356
}

export default App;