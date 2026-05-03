import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      logout();
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <nav className="bg-gray-800">
      <div className="nav-container">
        {user ? (
          <>
            <span className="nav-link">Hey {user.username}</span>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <button className="nav-link logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
