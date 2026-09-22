import { initializedSocketConnection } from "../services/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../services/chat.api";
import {
    setChats,
    addChat,
    removeChat,
    setMessages,
    addMessages,
    setCurrentChatId,
    setError,
    setLoading,
} from "../chat.slice";
import { setUser } from "../../auth/auth.slice";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
    const dispatch = useDispatch();
    const { chats, messages, currentChatId, isLoading, error } = useSelector(
        (state) => state.chat
    );
    const user = useSelector((state) => state.auth.user);

    async function handleGetChats() {
        try {
            const data = await getChats();
            dispatch(setChats(data.chats));
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message));
        }
    }

    async function handleSendMessage(message) {
        const chatId = currentChatId;

        dispatch(setError(null));
        dispatch(addMessages([{ content: message, role: "user" }]));
        dispatch(setLoading(true));

        try {
            const data = await sendMessage({ message, chatId });
            const { chat, aiMessage, messageCount } = data;

            if (!chatId) {
                dispatch(addChat(chat));
                dispatch(setCurrentChatId(chat._id));
            }

            dispatch(addMessages([aiMessage]));

            if (user) {
                dispatch(setUser({ ...user, messageCount }));
            }
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMessages(chatId) {
        dispatch(setError(null));
        dispatch(setCurrentChatId(chatId));
        dispatch(setLoading(true));

        try {
            const data = await getMessages(chatId);
            dispatch(setMessages(data.messages));
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    function startNewChat() {
        dispatch(setCurrentChatId(null));
        dispatch(setMessages([]));
    }

    async function handleDeleteChat(chatId) {
        dispatch(setError(null));

        try {
            await deleteChat(chatId);
            dispatch(removeChat(chatId));

            if (currentChatId === chatId) {
                startNewChat();
            }
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message));
        }
    }

    return {
        chats,
        messages,
        currentChatId,
        isLoading,
        error,
        getChats: handleGetChats,
        sendMessage: handleSendMessage,
        getMessages: handleGetMessages,
        startNewChat,
        deleteChat: handleDeleteChat,
        initializedSocketConnection,
    };
};
