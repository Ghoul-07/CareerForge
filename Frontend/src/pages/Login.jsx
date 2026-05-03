import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAuth();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        form,
        {
          withCredentials: true,
        },
      );

      const { user, accessToken } = response.data;

      login(user, accessToken);

      if (!user.githubUsername && !user.leetcodeUsername) {
        navigate("/onboarding");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="loginContainer">
      <h1>LOGIN YOUR ACCOUNT</h1>
      <form className="loginForm" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={form.email}
          placeholder="Enter Email"
          onChange={handleChange}
        ></input>

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={form.password}
          onChange={handleChange}
        ></input>
        <button className="loginSubmit">Submit</button>
      </form>
    </div>
  );
}

export default Login;
