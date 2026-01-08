import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = (): string | null => {
    if (!username.trim()) return "Username ist erforderlich";
    if (!password) return "Passwort ist erforderlich";
    return null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      await login(username.trim(), password);
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleSubmit();
    }
  };

  return (
    <div className="register-container">
      <h1>Login</h1>
      <div className="register-form">
        <input
          type="text"
          placeholder="Benutzername oder E-Mail"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Laden..." : "Anmelden"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <p>
        Noch kein Konto? <Link to="/register">Jetzt registrieren</Link>
      </p>
    </div>
  );
}

export default Login;
