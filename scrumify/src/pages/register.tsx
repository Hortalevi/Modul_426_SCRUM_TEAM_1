import React, { useState } from "react";
import { Link } from "react-router-dom";

interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

interface ApiErrorResponse {
  message?: string;
  errors?: { [key: string]: string[] };
  title?: string;
}

/**
 * Registration-Page — moderner, heller Look.
 * Wichtige Container-Klassen erhalten `liquid-register` als Suffix, z. B. `.auth-page-register.liquid-register`.
 */

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const validateForm = (): string | null => {
    if (!firstName.trim()) return "First name is required";
    if (!lastName.trim()) return "Last name is required";
    if (!username.trim()) return "Username is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Invalid email format";
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    const url = "http://localhost:5201/api/Register";

    try {
      const requestBody: RegisterRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password: password,
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMessage = "Registration failed";

        try {
          const data: ApiErrorResponse = await response.json();

          // Handle .NET validation errors format
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(", ");
            errorMessage =
                errorMessages || data.message || data.title || errorMessage;
          } else if (data.message) {
            errorMessage = data.message;
          } else if (data.title) {
            errorMessage = data.title;
          }
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      setSuccess("Account successfully created!");
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again later.");
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
      <div className="auth-page-register liquid-register">
        <div className="auth-card-register liquid-register" role="region" aria-label="Register">
          <h1 className="auth-title-register liquid-register">Register</h1>
          <p className="auth-note-register liquid-register">
            Erstelle dein Konto — es ist schnell und einfach.
          </p>

          <div className="auth-form-register liquid-register">
            <div className="form-group-register liquid-register">
              <input
                  className="auth-input-register liquid-register"
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="First Name"
              />
            </div>

            <div className="form-group-register liquid-register">
              <input
                  className="auth-input-register liquid-register"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Last Name"
              />
            </div>

            <div className="form-group-register liquid-register">
              <input
                  className="auth-input-register liquid-register"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Username"
              />
            </div>

            <div className="form-group-register liquid-register">
              <input
                  className="auth-input-register liquid-register"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Email"
              />
            </div>

            <div className="form-group-register liquid-register">
              <input
                  className="auth-input-register liquid-register"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  aria-label="Password"
              />
            </div>

            <div className="button-row-register liquid-register">
              <button
                  className="auth-button-register liquid-register"
                  onClick={handleSubmit}
                  disabled={loading}
                  aria-busy={loading}
              >
                {loading ? "Loading..." : "Create Account"}
              </button>
            </div>
          </div>

          {error && (
              <p className="error-register liquid-register" role="alert">
                {error}
              </p>
          )}
          {success && (
              <p className="success-register liquid-register" role="status">
                {success}
              </p>
          )}
          <div className="button-row-register liquid-register" style={{ marginTop: 12 }}>
            <p className="register-link-register liquid-register">
              Schon ein Konto? <Link to="/login">Jetzt anmelden</Link>
            </p>
          </div>
        </div>
      </div>
  );
}

export default Register;