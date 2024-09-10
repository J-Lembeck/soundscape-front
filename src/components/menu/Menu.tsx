import { Link } from "react-router-dom";

export default function Menu() {
    return (
        <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', backgroundColor: '#f0f0f0' }}>
            <Link to="/home" style={{ textDecoration: 'none', color: 'black' }}>Home</Link>
            <Link to="/upload" style={{ textDecoration: 'none', color: 'black' }}>Upload</Link>
        </nav>
    );
}
