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
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
    const dispatch = useDispatch();
    const { chats, messages, currentChatId, isLoading, error } = useSelector(
        (state) => state.chat
    );

    async function handleGetChats() {
        try {
            const data = await getChats();
            dispatch(setChats(data.chats));
        } catch (err) {
            dispatch(setError(err.message));
        }
    }

    async function handleSendMessage(message) {
        dispatch(setLoading(true));

        try {
            const data = await sendMessage({ message, chatId: currentChatId });
            const { chat, userMessage, aiMessage } = data;

            if (!currentChatId) {
                dispatch(addChat(chat));
                dispatch(setCurrentChatId(chat._id));
                dispatch(setMessages([userMessage, aiMessage]));
            } else {
                dispatch(addMessages([userMessage, aiMessage]));
            }
        } catch (err) {
            dispatch(setError(err.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    async function handleGetMessages(chatId) {
        dispatch(setCurrentChatId(chatId));
        dispatch(setLoading(true));

        try {
            const data = await getMessages(chatId);
            dispatch(setMessages(data.messages));
        } catch (err) {
            dispatch(setError(err.message));
        } finally {
            dispatch(setLoading(false));
        }
    }

    function startNewChat() {
        dispatch(setCurrentChatId(null));
        dispatch(setMessages([]));
    }

    async function handleDeleteChat(chatId) {
        await deleteChat(chatId);
        dispatch(removeChat(chatId));

        if (currentChatId === chatId) {
            startNewChat();
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
