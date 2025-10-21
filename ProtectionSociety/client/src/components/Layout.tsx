import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const linkStyle = {
        margin: '0 10px',
        padding: '5px',
        textDecoration: 'none',
        color: 'blue',
    };

    const activeStyle = {
        ...linkStyle,
        fontWeight: 'bold',
        color: 'rebeccapurple',
    };

    return (
        <div style={{
            maxWidth: '960px',
            margin: '0 auto',
            padding: '20px',
        }}>
            <header style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                <img src="/logo.jpg" alt="ProtectionSociety Logo" className="logo-dark" style={{ height: '80px', borderRadius: '8px' }} />
                <img src="/logo-light.jpg" alt="ProtectionSociety Logo" className="logo-light" style={{ height: '80px', borderRadius: '8px' }} />
            </header>

            <nav style={{
                padding: '20px',
                borderBottom: '1px solid #ccc',
                marginBottom: '20px',
                background: '#f4f4f4',
                borderRadius: '4px'
            }}>
                <NavLink
                    to="/"
                    style={({ isActive }) => isActive ? activeStyle : linkStyle}
                >
                    Checklist (Redux)
                </NavLink>
                <NavLink
                    to="/analytics"
                    style={({ isActive }) => isActive ? activeStyle : linkStyle}
                >
                    Analytics (Fetch)
                </NavLink>
                <NavLink
                    to="/tasks"
                    style={({ isActive }) => isActive ? activeStyle : linkStyle}
                >
                    Tasks (TanStack Query)
                </NavLink>
            </nav>

            <main style={{ padding: '0 20px' }}>
                {children}
            </main>
        </div>
    );
}

