export default function App() {
    return (
        <div className="homepage-wrapper liquid-home">
            <header className="homepage-header liquid-home" role="banner">
                <div className="homepage-logo liquid-home">Scrumify</div>
                <nav className="homepage-nav liquid-home" role="navigation" aria-label="Hauptnavigation">
                    <a href="/dashboard" className="nav-link nav-link-primary liquid-home">Dashboard</a>
                    <a href="/login" className="nav-link liquid-home">Anmelden</a>
                </nav>
            </header>

            <main className="homepage-main liquid-home" role="main">
                <div className="homepage-hero liquid-home" aria-labelledby="homepage-hero-title" style={{ background: "linear-gradient(180deg, #ffffff 0%, #fbfbfc 100%)" }}>
                    <h1 id="homepage-hero-title" className="homepage-hero-title liquid-home">Willkommen bei Scrumify</h1>
                    <p className="homepage-hero-text liquid-home">
                        Entdecke alle Möglichkeiten und starte noch heute. Melde dich an oder erstelle ein neues Konto.
                    </p>
                    <div className="homepage-cta-buttons liquid-home" style={{ display: "flex", gap: 12 }}>
                        <a href="/register" className="homepage-cta-btn cta-btn-primary liquid-home">
                            Registrieren
                        </a>
                        <a href="/login" className="homepage-cta-btn cta-btn-secondary liquid-home">
                            Anmelden
                        </a>
                    </div>
                </div>
            </main>

            <footer className="homepage-footer liquid-home" role="contentinfo">
                <p>&copy; 2026 Scrumify. Alle Rechte vorbehalten.</p>
            </footer>
        </div>
    );
}