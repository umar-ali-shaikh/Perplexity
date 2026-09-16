import { useDispatch } from "react-redux";
import { register, login, getMe } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";

export function useAuth() {
    const dispatch = useDispatch();

    async function handleRegister({ username, email, password }) {
        dispatch(setLoading(true));
        try {
            const data = await register({ username, email, password });
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Registration failed";
            dispatch(setError(message));
            throw new Error(message, { cause: error });
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleLogin({ email, password }) {
        dispatch(setLoading(true));
        try {
            const data = await login({ email, password });
            dispatch(setUser(data.user));
            return data;
        } catch (error) {
            const message = error.response?.data?.message || "Login failed";
            dispatch(setError(message));
            throw new Error(message, { cause: error });
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handlegetMe() {
        dispatch(setLoading(true));
        try {
            const data = await getMe();
            dispatch(setUser(data.user));
            return data;
        } catch {
            dispatch(setUser(null));
        } finally {
            dispatch(setLoading(false));
        }
    }

    return { handleRegister, handleLogin, handlegetMe };
}
