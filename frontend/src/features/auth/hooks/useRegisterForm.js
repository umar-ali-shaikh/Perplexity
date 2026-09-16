import { useCallback, useState } from "react";
import { useAuth } from "./useAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  if (name === "username") {
    const trimmed = value.trim();
    if (!trimmed) return "Name is required.";
    if (trimmed.length < 2 || trimmed.length > 50)
      return "Name must be between 2 and 50 characters.";
    return "";
  }
  if (name === "email") {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
    return "";
  }
  if (name === "password") {
    if (!value) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter.";
    if (!/[a-z]/.test(value)) return "Add at least one lowercase letter.";
    if (!/[0-9]/.test(value)) return "Add at least one number.";
    return "";
  }
  return "";
}

const INITIAL_VALUES = { username: "", email: "", password: "" };
const INITIAL_ERRORS = { username: "", email: "", password: "" };

export function useRegisterForm() {
  const { handleRegister } = useAuth();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) =>
      prev[name] ? { ...prev, [name]: validateField(name, value) } : prev,
    );
  }, []);

  const handleBlur = useCallback((event) => {
    const { name, value } = event.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    setFocusedField((current) => (current === name ? null : current));
  }, []);

  const handleFocus = useCallback((event) => {
    setFocusedField(event.target.name);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const nextErrors = {
        username: validateField("username", values.username),
        email: validateField("email", values.email),
        password: validateField("password", values.password),
      };
      setErrors(nextErrors);

      if (nextErrors.username || nextErrors.email || nextErrors.password) {
        setStatus("error");
        setFormError("Check the highlighted fields.");
        return;
      }

      setStatus("submitting");
      setFormError("");

      try {
        await handleRegister(values);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setFormError(error.message);
      }
    },
    [values, handleRegister],
  );

  return {
    values,
    errors,
    status,
    formError,
    focusedField,
    showPassword,
    handleChange,
    handleBlur,
    handleFocus,
    toggleShowPassword,
    handleSubmit,
  };
}
