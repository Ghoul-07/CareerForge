import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/api/auth/register", form, {
        withCredentials: true,
      });
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="registerContainer">
      <h1>REGISTER USER</h1>
      <form className="registerForm" onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={form.username}
          onChange={handleChange}
        ></input>

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
        <button className="registerSubmit">Submit</button>
      </form>
    </div>
  );
}

export default Register;
