import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Home() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="register-container">
      <h1>Willkommen, {username}!</h1>
      <div className="register-form">
        <p className="success">Sie sind erfolgreich angemeldet.</p>
        <button onClick={handleLogout}>Abmelden</button>
      </div>
    </div>
  );
}

export default Home;
