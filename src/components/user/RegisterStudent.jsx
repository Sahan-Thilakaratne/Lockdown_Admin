import React, { useMemo, useState } from "react";
import axios from "axios";
import BASE_URL from "../../config/apiConfig";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import { FiCheckCircle } from "react-icons/fi";

/**
 * StudentRegistrationForm
 * -----------------------
 * Minimal, production‑ready registration form that matches your Student model
 * and the provided controller `registerStudent` (expects: nameF, nameL, email, password).
 *
 * NOTE: If your route differs, update REGISTER_ENDPOINT below.
 */
const REGISTER_ENDPOINT = `${BASE_URL}/student/register`; // change to `${BASE_URL}/student` if your route is POST /student

const initial = { nameF: "", nameL: "", email: "", password: "", confirmPassword: "" };

export default function StudentRegistrationForm({ title = "Student Registration" }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const canSubmit = useMemo(() => {
    return (
      form.nameF.trim() &&
      form.nameL.trim() &&
      /\S+@\S+\.\S+/.test(form.email) &&
      validatePassword(form.password) === null &&
      form.password === form.confirmPassword &&
      !submitting
    );
  }, [form, submitting]);

  function validatePassword(pw) {
    if (!pw || pw.length < 8) return "Password must be at least 8 characters.";
    if (!/[a-z]/.test(pw)) return "Include at least one lowercase letter.";
    if (!/[A-Z]/.test(pw)) return "Include at least one uppercase letter.";
    if (!/[0-9]/.test(pw)) return "Include at least one number.";
    return null;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function validateAll() {
    const next = {};
    if (!form.nameF.trim()) next.nameF = "First name is required.";
    if (!form.nameL.trim()) next.nameL = "Last name is required.";
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = "Enter a valid email.";
    const pwErr = validatePassword(form.password);
    if (pwErr) next.password = pwErr;
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return;

    try {
      setSubmitting(true);
      const payload = {
        nameF: form.nameF.trim(),
        nameL: form.nameL.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const res = await axios.post(REGISTER_ENDPOINT, payload);
      const student = res?.data?.student;

      Swal.fire({
        icon: "success",
        title: "Registered successfully!",
        html:
          student?.studentId
            ? `<div style="font-size:14px;">Assigned Student ID: <b>${student.studentId}</b></div>`
            : undefined,
        timer: 2000,
        showConfirmButton: false,
      });

      setForm(initial);
      // Optional: redirect to login or student list
      // navigate("/login");
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed. Please try again.";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="col-xxl-8 mx-auto">
      <div className="card stretch stretch-full">
        <div className="card-header d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{title}</h5>
          <div className="d-flex align-items-center gap-2">
            <FiCheckCircle className="text-success" />
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.nameF ? "is-invalid" : ""}`}
                  name="nameF"
                  value={form.nameF}
                  onChange={handleChange}
                  placeholder="e.g., Jane"
                  autoComplete="given-name"
                />
                {errors.nameF && <div className="invalid-feedback">{errors.nameF}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className={`form-control ${errors.nameL ? "is-invalid" : ""}`}
                  name="nameL"
                  value={form.nameL}
                  onChange={handleChange}
                  placeholder="e.g., Doe"
                  autoComplete="family-name"
                />
                {errors.nameL && <div className="invalid-feedback">{errors.nameL}</div>}
              </div>

              <div className="col-md-12">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  autoComplete="email"
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.password ? "is-invalid" : ""}`}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                {!errors.password && form.password && (
                  <div className="form-text">Strong password ✓</div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">{errors.confirmPassword}</div>
                )}
              </div>

              <div className="col-12 d-flex align-items-center justify-content-between mt-2">
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">
                    Already have an account? <Link to="/login">Login</Link>
                  </small>
                </div>
                <Button type="submit" disabled={!canSubmit}>
                  {submitting ? "Registering..." : "Register"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
