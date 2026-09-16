import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./useAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateField(name, value) {
  if (name === "email") {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_PATTERN.test(value.trim())) return "Enter a valid email address.";
    return "";
  }
  if (name === "password") {
    return value ? "" : "Password is required.";
  }
  return "";
}

const INITIAL_VALUES = { email: "", password: "" };
const INITIAL_ERRORS = { email: "", password: "" };

export function useLoginForm() {
  const navigate = useNavigate();
  const { handleLogin } = useAuth();
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
        email: validateField("email", values.email),
        password: validateField("password", values.password),
      };
      setErrors(nextErrors);

      if (nextErrors.email || nextErrors.password) {
        setStatus("error");
        setFormError("Check the highlighted fields.");
        return;
      }

      setStatus("submitting");
      setFormError("");

      try {
        await handleLogin(values);
        setStatus("success");
        // brief pause so the success state is visible before navigating away
        await new Promise((resolve) => setTimeout(resolve, 600));
        navigate("/");
      } catch (error) {
        setStatus("error");
        setFormError(error.message);
      }
    },
    [values, handleLogin, navigate],
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
