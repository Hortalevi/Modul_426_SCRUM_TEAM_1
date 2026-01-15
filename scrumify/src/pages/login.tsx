import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Login-Page — helles, modernes Layout.
 * Jede wichtige Container-Klasse erhält die suffix-Klasse `liquid-login` damit Styles komponentenspezifisch angesprochen werden können.
 */

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
      <div className="auth-page liquid-login">
        <div className="auth-card liquid-login" role="region" aria-label="Login">
          <h1 className="auth-title liquid-login">Login</h1>
          <p className="auth-note liquid-login">Melde dich mit deinem Benutzernamen oder E‑Mail an.</p>

          <div className="auth-form liquid-login">
            <div className="form-group liquid-login">
              <input
                  className="auth-input liquid-login"
                  type="text"
                  placeholder="Benutzername oder E-Mail"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Benutzername oder E-Mail"
              />
            </div>

            <div className="form-group liquid-login">
              <input
                  className="auth-input liquid-login"
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Passwort"
              />
            </div>

            <div className="button-row liquid-login">
              <button
                  className="auth-button liquid-login"
                  onClick={handleSubmit}
                  disabled={loading}
                  aria-busy={loading}
              >
                {loading ? "Laden..." : "Anmelden"}
              </button>
            </div>
          </div>

          {error && <p className="error liquid-login" role="alert">{error}</p>}

          <div className="button-row liquid-login" style={{ marginTop: 12 }}>
            <p className="register-link liquid-login">
              Noch kein Konto? <Link to="/register">Jetzt registrieren</Link>
            </p>
          </div>
        </div>
      </div>
  );
}

export default Login;