import { useState } from "react";

interface User {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
  members: User[];
}

const Dashboard: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [memberName, setMemberName] = useState("");
  const [members, setMembers] = useState<User[]>([]);
  const [error, setError] = useState("");

  // Member hinzufügen
  const addMember = () => {
    if (!memberName.trim()) return;
    setMembers((prev) => [
      ...prev,
      { id: Date.now(), name: memberName.trim() },
    ]);
    setMemberName("");
  };

  // Team erstellen
  const createTeam = () => {
    if (!teamName.trim()) {
      setError("Teamname darf nicht leer sein");
      return;
    }
    if (members.length === 0) {
      setError("Mindestens ein Mitglied hinzufügen");
      return;
    }

    const newTeam: Team = {
      id: Date.now(),
      name: teamName.trim(),
      members,
    };

    setTeams((prev) => [...prev, newTeam]);
    setTeamName("");
    setMembers([]);
    setMemberName("");
    setError("");
    setShowModal(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Dashboard</h1>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Team anlegen
        </button>
      </header>

      {/* Teams */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {teams.map((team) => (
          <div
            key={team.id}
            style={{
              padding: "16px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              background: "#f9f9f9",
            }}
          >
            <h2>{team.name}</h2>
            <p>
              Mitglieder: {team.members.map((m) => m.name).join(", ")}
            </p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              width: "300px",
            }}
          >
            <h2>Neues Team erstellen</h2>

            {/* Teamname */}
            <input
              type="text"
              placeholder="Team Name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />

            {/* Mitglieder hinzufügen */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                type="text"
                placeholder="Mitglied Name"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                style={{ flex: 1, padding: "8px" }}
              />
              <button onClick={addMember}>Hinzufügen</button>
            </div>

            {/* Mitgliederliste */}
            <div style={{ marginBottom: "10px" }}>
              {members.length > 0 && (
                <ul>
                  {members.map((m) => (
                    <li key={m.id}>{m.name}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Fehler anzeigen */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Aktionen */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={createTeam}>Team erstellen</button>
              <button onClick={() => setShowModal(false)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
