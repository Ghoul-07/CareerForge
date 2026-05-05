import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { useNavigate, Link, NavLink } from "react-router-dom";

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
    <nav className="bg-[#0f172a] border-b border-[#1e293b] px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link
        to="/dashboard"
        className="text-white font-bold text-lg"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Career<span className="text-indigo-400">Forge</span>
      </Link>

      {user ? (
        <div className="flex items-center gap-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/resume"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            Resume
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            History
          </NavLink>
          <NavLink
            to="/interview/setup"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            Interview
          </NavLink>
          <NavLink
            to="/onboarding"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            Profiles
          </NavLink>

          {/* Avatar + username */}
          <div className="flex items-center gap-2 ml-2">
            <img
              src={`https://github.com/${user.githubUsername}.png`}
              alt="avatar"
              className="w-8 h-8 rounded-full border border-[#1e293b]"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`;
              }}
            />
            <span className="text-white text-base font-medium">
              {user.username}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 text-base transition-all"
          >
            Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            Login
          </NavLink>
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive
                ? "text-white text-base font-semibold"
                : "text-slate-400 hover:text-white text-base transition-all"
            }
          >
            Register
          </NavLink>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
