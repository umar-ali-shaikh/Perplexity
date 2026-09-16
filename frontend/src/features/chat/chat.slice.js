import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        chats: [],
        messages: [],
        currentChatId: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        createNewChat: (state, action) => {
            const { chatId, title } = action.payload
            state.chats.unshift({
                _id: chatId,
                title,
                messages: [],
                lastUpdated: new Date().toISOString(),
            })
        },
        addNewMessage: (state, action) => {
            const { chatId, content, role } = action.payload
            const chat = state.chats.find((chat) => chat._id === chatId)
            if (chat) {
                chat.messages.push({ content, role })
            }
        },
        setChats: (state, action) => {
            state.chats = action.payload
        },
        addChat: (state, action) => {
            state.chats.unshift(action.payload)
        },
        removeChat: (state, action) => {
            state.chats = state.chats.filter((chat) => chat._id !== action.payload)
        },
        setMessages: (state, action) => {
            state.messages = action.payload
        },
        addMessages: (state, action) => {
            state.messages.push(...action.payload)
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        }
    }
})

export const {
    createNewChat,
    addNewMessage,
    setChats,
    addChat,
    removeChat,
    setMessages,
    addMessages,
    setCurrentChatId,
    setLoading,
    setError
} = chatSlice.actions;

export default chatSlice.reducer;