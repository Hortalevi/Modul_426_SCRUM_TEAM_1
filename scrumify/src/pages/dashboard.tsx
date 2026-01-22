'use client';

import { useEffect, useState, useCallback, type FormEvent } from "react";

/**
 * Erweitertes Dashboard-UI mit Team-Mitgliedern:
 * - Team-Auswahl (Dropdown)
 * - Team-Details mit Mitgliederliste
 * - Projekte pro Team
 * - Buttons + modale Formulare zum Erstellen von Teams, Projekten und Hinzufügen von Mitgliedern
 * - Persistence via API calls to .NET backend
 */

const API_BASE = 'http://localhost:5201'; // or your API URL

type User = {
  id: number;
  name: string;
  email: string;
  username?: string;
};

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: string;
  username?: string;
  joinedAt?: string;
};

type Team = {
  id: number;
  name: string;
  description?: string;
  members: TeamMember[];
  createdAt: string;
};

type Project = {
  id: number;
  teamId: number;
  name: string;
  description?: string;
  createdAt: string;
};

export default function Dashboard() {
  // User state for available users (to add to teams)
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Teams loaded from API
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
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
  const [memberRole, setMemberRole] = useState("Developer");

  // Fetch members for a specific team
  const fetchTeamMembers = useCallback(async (teamId: number): Promise<TeamMember[]> => {
    try {
      const response = await fetch(`${API_BASE}/api/scrum-groups/${teamId}/members`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error(`Error fetching members for team ${teamId}:`, error);
      return [];
    }
  }, []);

  // Fetch all teams (scrum groups) from API
  const fetchTeams = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/scrum-groups`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      const teamsData = await response.json();

      // Fetch members for each team
      const teamsWithMembers = await Promise.all(
        teamsData.map(async (team: { id: number; name: string; description?: string; createdAt: string }) => {
          const members = await fetchTeamMembers(team.id);
          return { ...team, members };
        })
      );

      setTeams(teamsWithMembers);

      // Set first team as selected if none selected
      if (teamsWithMembers.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamsWithMembers[0].id);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  }, [fetchTeamMembers, selectedTeamId]);

  // Fetch available users (users not yet in the selected team)
  const fetchAvailableUsers = useCallback(async (teamId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/users/available/${teamId}`);
      if (!response.ok) throw new Error('Failed to fetch available users');
      const users = await response.json();
      setAvailableUsers(users);
      // Pre-select first user if available
      if (users.length > 0) {
        setSelectedUserId(users[0].id);
      } else {
        setSelectedUserId(null);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
      setAvailableUsers([]);
    }
  }, []);

  // Fetch projects for the selected team
  const fetchProjects = useCallback(async (teamId: number) => {
    try {
      const response = await fetch(`${API_BASE}/api/projects?teamId=${teamId}`);
      if (!response.ok) return;
      const projectsData = await response.json();
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await fetchTeams();
      setIsLoading(false);
    };
    loadInitialData();
  }, [fetchTeams]);

  // Fetch available users when add member modal opens
  useEffect(() => {
    if (showAddMember && selectedTeamId) {
      fetchAvailableUsers(selectedTeamId);
    }
  }, [showAddMember, selectedTeamId, fetchAvailableUsers]);

  // Fetch projects when selected team changes
  useEffect(() => {
    if (selectedTeamId) {
      fetchProjects(selectedTeamId);
    }
  }, [selectedTeamId, fetchProjects]);

  // Events
  async function handleCreateTeam(e: FormEvent) {
    e.preventDefault();
    if (!teamName.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/scrum-groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName.trim(),
          description: teamDesc.trim() || null
        })
      });

      if (!response.ok) throw new Error('Failed to create team');

      const savedTeam = await response.json();
      const newTeam: Team = {
        ...savedTeam,
        members: []
      };

      setTeams((prev) => [newTeam, ...prev]);
      setSelectedTeamId(newTeam.id);
      setTeamName("");
      setTeamDesc("");
      setShowCreateTeam(false);
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Fehler beim Erstellen des Teams');
    }
  }

  async function handleCreateProject(e: FormEvent) {
    e.preventDefault();
    if (!projectName.trim() || !selectedTeamId) return;

    try {
      const response = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: selectedTeamId,
          name: projectName.trim(),
          description: projectDesc.trim() || null
        })
      });

      if (!response.ok) throw new Error('Failed to create project');

      const savedProject = await response.json();
      setProjects((prev) => [savedProject, ...prev]);
      setProjectName("");
      setProjectDesc("");
      setShowCreateProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Fehler beim Erstellen des Projekts');
    }
  }

  async function handleAddMember(e: FormEvent) {
    e.preventDefault();
    if (!selectedUserId || !selectedTeamId) return;

    try {
      // Call backend API with userId and role (backend expects AddMemberDto)
      const response = await fetch(`${API_BASE}/api/scrum-groups/${selectedTeamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          role: memberRole
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to add member');
      }

      const savedMember: TeamMember = await response.json();

      // Update local state with the saved member (including server-generated ID)
      setTeams(prev => prev.map(team => {
        if (team.id === selectedTeamId) {
          return {
            ...team,
            members: [...team.members, savedMember]
          };
        }
        return team;
      }));

      // Remove the added user from available users list
      setAvailableUsers(prev => prev.filter(u => u.id !== selectedUserId));

      // Reset form
      setSelectedUserId(availableUsers.find(u => u.id !== selectedUserId)?.id ?? null);
      setMemberRole("Developer");
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Fehler beim Hinzufügen des Mitglieds: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  }

  async function deleteProject(id: number) {
    try {
      const response = await fetch(`${API_BASE}/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete project');

      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Fehler beim Löschen des Projekts');
    }
  }

  async function deleteMember(memberId: number) {
    if (!selectedTeamId) return;

    try {
      const response = await fetch(`${API_BASE}/api/scrum-groups/${selectedTeamId}/members/${memberId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove member');

      setTeams(prev => prev.map(team => {
        if (team.id === selectedTeamId) {
          return {
            ...team,
            members: team.members.filter(member => member.id !== memberId)
          };
        }
        return team;
      }));
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Fehler beim Entfernen des Mitglieds');
    }
  }

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const projectsForSelectedTeam = projects.filter((p) => p.teamId === selectedTeamId);

  if (isLoading) {
    return (
      <div className="dashboard-root">
        <div className="home-card-dash has-dashboard-header liquid-dashboard" style={{ textAlign: "center", padding: 48 }}>
          <p>Lade Teams...</p>
        </div>
      </div>
    );
  }

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
                value={selectedTeamId ?? ''}
                onChange={(e) => setSelectedTeamId(Number(e.target.value))}
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
                <label htmlFor="member-user">Benutzer auswählen *</label>
                {availableUsers.length > 0 ? (
                  <select
                    id="member-user"
                    className="auth-input liquid-dashboard"
                    value={selectedUserId ?? ''}
                    onChange={(e) => setSelectedUserId(Number(e.target.value))}
                    required
                  >
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "8px 0" }}>
                    Keine verfügbaren Benutzer. Alle Benutzer sind bereits Mitglieder dieses Teams.
                  </p>
                )}
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
                <button
                  type="submit"
                  className="auth-button liquid-dashboard"
                  style={{ width: "auto", minWidth: 120 }}
                  disabled={!selectedUserId || availableUsers.length === 0}
                >
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
