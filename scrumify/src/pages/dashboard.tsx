import { useEffect, useState, type FormEvent } from "react";

/**
 * Einfaches Dashboard-UI (modern, hell, konsistent):
 * - Team-Auswahl (Dropdown)
 * - Liste aller Projekte im ausgewählten Team
 * - Buttons + modale Formulare zum Erstellen von Teams und Projekten
 *
 * Hinweis: keine Backend-Integration — alles läuft lokal (State). IDs werden einfach als Zeitstempel generiert.
 *
 * Styling-Hinweis: Jede sichtbare Wurzel-/Card-Klasse bekommt am Ende die komponentenspezifische Klasse `liquid-dashboard`
 * damit Styles pro Komponente leicht angesprochen werden können (z. B. `.home-card-dash.liquid-dashboard`).
 */

type Team = {
    id: string;
    name: string;
    description?: string;
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
            { id: "team-1", name: "Design", description: "UI/UX Team" },
            { id: "team-2", name: "Frontend", description: "React und Web" },
            { id: "team-3", name: "Backend", description: "APIs & Services" },
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

    // Form fields
    const [teamName, setTeamName] = useState("");
    const [teamDesc, setTeamDesc] = useState("");

    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");

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

    function projectsForSelectedTeam() {
        return projects.filter((p) => p.teamId === selectedTeamId);
    }

    function deleteProject(id: string) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
    }

    const selectedTeam = teams.find((t) => t.id === selectedTeamId);

    return (
        // Root wrapper für die Komponente — helle, moderne Layout-Klassen.
        <div className="dashboard-root">
            {/* NOTE: has-dashboard-header sorgt für zusätzlichen Padding-Top für den Header (neue CSS-Klasse) */}
            <div className="home-card-dash has-dashboard-header liquid-dashboard" >
                {/* Dashboard Header (oben links Dropdown + Aktionen rechts) */}
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
                                        {t.name}
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
                            onClick={() => setShowCreateProject(true)}
                            title="Neues Projekt erstellen"
                        >
                            Projekt erstellen
                        </button>
                    </div>
                </div>

                <div className="dashboard-hero liquid-dashboard" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <div>
                        <h1 className="hero-title liquid-dashboard">Team Dashboard</h1>
                        <p className="hero-sub liquid-dashboard">Wähle ein Team, um dessen Projekte zu sehen oder erstelle neue Teams / Projekte.</p>
                    </div>
                </div>

                <section className="project-section liquid-dashboard" aria-labelledby="projects-heading">
                    <h2 id="projects-heading" className="hero-title liquid-dashboard" style={{ fontSize: "1.35rem", marginTop: 6 }}>
                        Projekte
                    </h2>

                    {selectedTeamId ? (
                        <>
                            {projectsForSelectedTeam().length > 0 ? (
                                <div className="project-grid liquid-dashboard" style={{ marginTop: 12 }}>
                                    {projectsForSelectedTeam().map((proj) => (
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
                                <label htmlFor="team-name">Team-Name</label>
                                <input
                                    id="team-name"
                                    type="text"
                                    className="auth-input liquid-dashboard"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    placeholder="Z. B. Marketing"
                                />
                            </div>

                            <div className="form-row liquid-dashboard">
                                <label htmlFor="team-desc">Beschreibung (optional)</label>
                                <input
                                    id="team-desc"
                                    type="text"
                                    className="auth-input liquid-dashboard"
                                    value={teamDesc}
                                    onChange={(e) => setTeamDesc(e.target.value)}
                                    placeholder="Kurze Beschreibung"
                                />
                            </div>

                            <div className="row-actions liquid-dashboard">
                                <button type="button" className="auth-button btn-outline liquid-dashboard" onClick={() => setShowCreateTeam(false)} style={{ width: "auto", minWidth: 120 }}>
                                    Abbrechen
                                </button>
                                <button type="submit" className="auth-button liquid-dashboard" style={{ width: "auto", minWidth: 120 }}>
                                    Erstellen
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
                        <h3 style={{ marginTop: 0 }}>Neues Projekt erstellen</h3>

                        <form onSubmit={handleCreateProject}>
                            <div className="form-row liquid-dashboard">
                                <label htmlFor="project-name">Projekt-Name</label>
                                <input
                                    id="project-name"
                                    type="text"
                                    className="auth-input liquid-dashboard"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Z. B. Mobile App"
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
                                />
                            </div>

                            <div className="row-actions liquid-dashboard">
                                <button type="button" className="auth-button btn-outline liquid-dashboard" onClick={() => setShowCreateProject(false)} style={{ width: "auto", minWidth: 120 }}>
                                    Abbrechen
                                </button>
                                <button type="submit" className="auth-button liquid-dashboard" style={{ width: "auto", minWidth: 120 }}>
                                    Erstellen
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}