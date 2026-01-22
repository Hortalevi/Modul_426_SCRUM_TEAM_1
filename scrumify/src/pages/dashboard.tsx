import { useEffect, useState, type FormEvent } from "react";

/**
 * Erweitertes Dashboard-UI mit Team-Mitgliedern:
 * - Team-Auswahl (Dropdown)
 * - Team-Details mit Mitgliederliste
 * - Projekte pro Team
 * - Buttons + modale Formulare zum Erstellen von Teams, Projekten und Hinzufügen von Mitgliedern
 */

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string; // z.B. "Developer", "Designer", "Product Owner", "Scrum Master"
};

type Team = {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
};

type Project = {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  createdAt: string;
};

export default function Dashboard() {
  // Beispiel-Dateninitialisierung
  const [teams, setTeams] = useState<Team[]>(
    () => [
      { 
        id: "team-1", 
        name: "Design", 
        description: "UI/UX Team", 
        members: [
          { id: "member-1", name: "Anna Schmidt", email: "anna@example.com", role: "Lead Designer" },
          { id: "member-2", name: "Max Mustermann", email: "max@example.com", role: "UX Designer" }
        ],
        createdAt: new Date().toISOString()
      },
      { 
        id: "team-2", 
        name: "Frontend", 
        description: "React und Web", 
        members: [
          { id: "member-3", name: "Lisa Weber", email: "lisa@example.com", role: "Senior Developer" },
          { id: "member-4", name: "Tom Bauer", email: "tom@example.com", role: "Junior Developer" }
        ],
        createdAt: new Date().toISOString()
      },
      { 
        id: "team-3", 
        name: "Backend", 
        description: "APIs & Services", 
        members: [
          { id: "member-5", name: "Sarah Müller", email: "sarah@example.com", role: "Backend Lead" },
          { id: "member-6", name: "Paul Fischer", email: "paul@example.com", role: "DevOps Engineer" }
        ],
        createdAt: new Date().toISOString()
      },
    ]
  );

  const [projects, setProjects] = useState<Project[]>(
    () => [
      { id: "proj-1", teamId: "team-1", name: "Landing Redesign", description: "Hero & pricing", createdAt: new Date().toISOString() },
      { id: "proj-2", teamId: "team-2", name: "Dashboard v2", description: "Neues Grid & Filters", createdAt: new Date().toISOString() },
      { id: "proj-3", teamId: "team-3", name: "Auth Service", description: "OAuth2 + Sessions", createdAt: new Date().toISOString() },
    ]
  );

  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id ?? "");
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Form fields für Team
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

  // Form fields für Projekt
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  // Form fields für Mitglied
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("Developer");

  // Wenn das Team-Array sich ändert und kein selectedTeam gesetzt ist, selektiere erstes
  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Events
  function handleCreateTeam(e: FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;
    const newTeam: Team = {
      id: "team-" + Date.now(),
      name: teamName.trim(),
      description: teamDesc.trim() || undefined,
      members: [], // Neues Team startet ohne Mitglieder
      createdAt: new Date().toISOString()
    };
    setTeams((prev) => [newTeam, ...prev]);
    setSelectedTeamId(newTeam.id);
    setTeamName("");
    setTeamDesc("");
    setShowCreateTeam(false);
  }

  function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!projectName.trim() || !selectedTeamId) return;
    const newProj: Project = {
      id: "proj-" + Date.now(),
      teamId: selectedTeamId,
      name: projectName.trim(),
      description: projectDesc.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setProjects((prev) => [newProj, ...prev]);
    setProjectName("");
    setProjectDesc("");
    setShowCreateProject(false);
  }

  function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim() || !selectedTeamId) return;
    
    const newMember: TeamMember = {
      id: "member-" + Date.now(),
      name: memberName.trim(),
      email: memberEmail.trim(),
      role: memberRole
    };

    setTeams(prev => prev.map(team => {
      if (team.id === selectedTeamId) {
        return {
          ...team,
          members: [...team.members, newMember]
        };
      }
      return team;
    }));

    setMemberName("");
    setMemberEmail("");
    setMemberRole("Developer");
    setShowAddMember(false);
  }

  function deleteProject(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  function deleteMember(memberId: string) {
    setTeams(prev => prev.map(team => {
      if (team.id === selectedTeamId) {
        return {
          ...team,
          members: team.members.filter(member => member.id !== memberId)
        };
      }
      return team;
    }));
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const projectsForSelectedTeam = projects.filter((p) => p.teamId === selectedTeamId);

  return (
    <div className="dashboard-root">
      <div className="home-card-dash has-dashboard-header liquid-dashboard">
        {/* Dashboard Header */}
        <div className="dashboard-header liquid-dashboard" role="toolbar" aria-label="Dashboard header">
          <div className="dashboard-header-left liquid-dashboard">
            <div className="team-badge liquid-dashboard" aria-hidden="true">
              {selectedTeam ? selectedTeam.name : "Kein Team"}
            </div>

            <div className="team-selector liquid-dashboard" style={{ marginLeft: 8 }}>
              <label htmlFor="team-select" style={{ display: "none" }}>Aktuelles Team</label>
              <select
                id="team-select"
                className="team-select team-select-enhanced liquid-dashboard"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                aria-label="Team wählen"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.members.length} Mitglieder)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="top-actions liquid-dashboard" role="group" aria-label="Team actions">
            <button
              type="button"
              className="auth-button btn-outline liquid-dashboard"
              onClick={() => setShowCreateTeam(true)}
              title="Neues Team erstellen"
            >
              Team erstellen
            </button>

            <button
              type="button"
              className="auth-button btn-outline liquid-dashboard"
              onClick={() => setShowAddMember(true)}
              disabled={!selectedTeamId}
              title="Mitglied hinzufügen"
            >
              Mitglied hinzufügen
            </button>

            <button
              type="button"
              className="auth-button btn-outline liquid-dashboard"
              onClick={() => setShowCreateProject(true)}
              disabled={!selectedTeamId}
              title="Neues Projekt erstellen"
            >
              Projekt erstellen
            </button>
          </div>
        </div>

        {/* Team Info Section */}
        {selectedTeam && (
          <div className="team-info-section liquid-dashboard" style={{ marginBottom: 24 }}>
            <h2 className="hero-title liquid-dashboard" style={{ fontSize: "1.35rem", marginBottom: 12 }}>
              {selectedTeam.name}
            </h2>
            <p className="hero-sub liquid-dashboard" style={{ marginBottom: 16 }}>
              {selectedTeam.description || "Keine Beschreibung"}
            </p>
            
            {/* Mitgliederliste */}
            <div className="members-section liquid-dashboard">
              <h3 style={{ fontSize: "1.1rem", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>Team-Mitglieder ({selectedTeam.members.length})</span>
                <button
                  type="button"
                  className="auth-button btn-outline liquid-dashboard"
                  onClick={() => setShowAddMember(true)}
                  style={{ width: "auto", minWidth: 120 }}
                >
                  + Mitglied
                </button>
              </h3>
              
              {selectedTeam.members.length > 0 ? (
                <div className="members-grid liquid-dashboard" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
                  {selectedTeam.members.map((member) => (
                    <div key={member.id} className="member-card liquid-dashboard" style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 16, background: "#f8fafc" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <h4 style={{ margin: "0 0 4px 0", fontWeight: 600 }}>{member.name}</h4>
                          <p style={{ margin: "0 0 4px 0", color: "#64748b", fontSize: "0.9rem" }}>{member.email}</p>
                          <span className="role-badge liquid-dashboard" style={{ 
                            display: "inline-block", 
                            background: "#e2e8f0", 
                            padding: "2px 8px", 
                            borderRadius: 12, 
                            fontSize: "0.8rem",
                            color: "#475569"
                          }}>
                            {member.role}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="auth-button btn-danger meta-button liquid-dashboard"
                          style={{ width: "auto", minWidth: 90, height: 32, padding: "0 12px" }}
                          onClick={() => deleteMember(member.id)}
                          aria-label={`${member.name} entfernen`}
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state liquid-dashboard" style={{ textAlign: "center", padding: 24, color: "#64748b" }}>
                  Dieses Team hat noch keine Mitglieder. Füge das erste Mitglied hinzu!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Projekte Section */}
        <section className="project-section liquid-dashboard" aria-labelledby="projects-heading">
          <h2 id="projects-heading" className="hero-title liquid-dashboard" style={{ fontSize: "1.35rem", marginTop: 6 }}>
            Projekte
          </h2>

          {selectedTeamId ? (
            <>
              {projectsForSelectedTeam.length > 0 ? (
                <div className="project-grid liquid-dashboard" style={{ marginTop: 12 }}>
                  {projectsForSelectedTeam.map((proj) => (
                    <article key={proj.id} className="project-item enhanced liquid-dashboard" aria-labelledby={`proj-${proj.id}-title`}>
                      <h3 id={`proj-${proj.id}-title`}>{proj.name}</h3>
                      <p>{proj.description ?? "Keine Beschreibung"}</p>
                      <div className="project-meta liquid-dashboard">
                        <span>Erstellt: {new Date(proj.createdAt).toLocaleDateString()}</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className="auth-button btn-outline meta-button liquid-dashboard"
                            style={{ width: "auto", minWidth: 90 }}
                            onClick={() => alert(`Öffne Projekt: ${proj.name}`)}
                            aria-label={`Öffne ${proj.name}`}
                          >
                            Öffnen
                          </button>
                          <button
                            className="auth-button btn-danger meta-button meta-delete liquid-dashboard"
                            style={{ width: "auto", minWidth: 90 }}
                            onClick={() => deleteProject(proj.id)}
                            aria-label={`Lösche ${proj.name}`}
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state liquid-dashboard">
                  Dieses Team hat noch keine Projekte. Erstelle ein neues Projekt, um loszulegen.
                </div>
              )}
            </>
          ) : (
            <div className="empty-state liquid-dashboard">Bitte wähle zuerst ein Team aus.</div>
          )}
        </section>
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="modal liquid-dashboard" role="dialog" aria-modal="true" aria-label="Team erstellen">
          <div className="modal-content liquid-dashboard">
            <h3 style={{ marginTop: 0 }}>Neues Team erstellen</h3>
            <form onSubmit={handleCreateTeam}>
              <div className="form-row liquid-dashboard">
                <label htmlFor="team-name">Team-Name *</label>
                <input
                  id="team-name"
                  type="text"
                  className="auth-input liquid-dashboard"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Z. B. Marketing"
                  required
                />
              </div>

              <div className="form-row liquid-dashboard">
                <label htmlFor="team-desc">Beschreibung (optional)</label>
                <textarea
                  id="team-desc"
                  className="auth-input liquid-dashboard"
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Kurze Beschreibung des Teams"
                  rows={3}
                />
              </div>

              <div className="row-actions liquid-dashboard">
                <button type="button" className="auth-button btn-outline liquid-dashboard" onClick={() => setShowCreateTeam(false)} style={{ width: "auto", minWidth: 120 }}>
                  Abbrechen
                </button>
                <button type="submit" className="auth-button liquid-dashboard" style={{ width: "auto", minWidth: 120 }}>
                  Team erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="modal liquid-dashboard" role="dialog" aria-modal="true" aria-label="Mitglied hinzufügen">
          <div className="modal-content liquid-dashboard">
            <h3 style={{ marginTop: 0 }}>Mitglied zu {selectedTeam?.name} hinzufügen</h3>
            <form onSubmit={handleAddMember}>
              <div className="form-row liquid-dashboard">
                <label htmlFor="member-name">Name *</label>
                <input
                  id="member-name"
                  type="text"
                  className="auth-input liquid-dashboard"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Vollständiger Name"
                  required
                />
              </div>

              <div className="form-row liquid-dashboard">
                <label htmlFor="member-email">E-Mail *</label>
                <input
                  id="member-email"
                  type="email"
                  className="auth-input liquid-dashboard"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="email@beispiel.com"
                  required
                />
              </div>

              <div className="form-row liquid-dashboard">
                <label htmlFor="member-role">Rolle</label>
                <select
                  id="member-role"
                  className="auth-input liquid-dashboard"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                >
                  <option value="Developer">Developer</option>
                  <option value="Designer">Designer</option>
                  <option value="Product Owner">Product Owner</option>
                  <option value="Scrum Master">Scrum Master</option>
                  <option value="Tester">Tester</option>
                  <option value="DevOps">DevOps Engineer</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>

              <div className="row-actions liquid-dashboard">
                <button type="button" className="auth-button btn-outline liquid-dashboard" onClick={() => setShowAddMember(false)} style={{ width: "auto", minWidth: 120 }}>
                  Abbrechen
                </button>
                <button type="submit" className="auth-button liquid-dashboard" style={{ width: "auto", minWidth: 120 }}>
                  Hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="modal liquid-dashboard" role="dialog" aria-modal="true" aria-label="Projekt erstellen">
          <div className="modal-content liquid-dashboard">
            <h3 style={{ marginTop: 0 }}>Neues Projekt in {selectedTeam?.name}</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-row liquid-dashboard">
                <label htmlFor="project-name">Projekt-Name *</label>
                <input
                  id="project-name"
                  type="text"
                  className="auth-input liquid-dashboard"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Z. B. Mobile App"
                  required
                />
              </div>

              <div className="form-row liquid-dashboard">
                <label htmlFor="project-desc">Beschreibung (optional)</label>
                <textarea
                  id="project-desc"
                  className="auth-input liquid-dashboard"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Kurze Beschreibung des Projekts"
                  rows={3}
                />
              </div>

              <div className="row-actions liquid-dashboard">
                <button type="button" className="auth-button btn-outline liquid-dashboard" onClick={() => setShowCreateProject(false)} style={{ width: "auto", minWidth: 120 }}>
                  Abbrechen
                </button>
                <button type="submit" className="auth-button liquid-dashboard" style={{ width: "auto", minWidth: 120 }}>
                  Projekt erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}