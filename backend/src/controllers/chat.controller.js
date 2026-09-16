import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js"
import { generateResponse, generateChatTitle } from "../services/ai.service.js";

export async function sendMessage(req, res) {
    const { message: messageText, chatId } = req.body;

    let chat = null;

    if (chatId) {
        chat = await Chat.findOne({ _id: chatId, user: req.user.id });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }
    } else {
        const title = await generateChatTitle(messageText);

        chat = await Chat.create({
            user: req.user.id,
            title
        });
    }

    const userMessage = await Message.create({
        chat: chat._id,
        content: messageText,
        role: "user"
    });

    const aiResponseText = await generateResponse(messageText);

    const aiMessage = await Message.create({
        chat: chat._id,
        content: aiResponseText,
        role: "ai"
    });

    res.status(201).json({
        chat,
        userMessage,
        aiMessage
    });
}

export async function getChats(req, res) {
    const user = req.user;
    const chats = await Chat.find({ user: user.id });

    res.status(200).json({
        message: "Chat retrieved successfully",
        chats
    })
}


export async function getMessages(req, res) {
    const { chatId } = req.params;
    const chat = await Chat.findOne({
        _id: chatId,
        user: req.user.id
    });

    if (!chat) {
        return res.status(404).json({
            message: " Chat not found"
        })
    }


    const messages = await Message.find({
        chat: chatId
    });


    return res.status(200).json({
        message: "Message retrieved successfully",
        messages
    })
}


export async function deleteChat(req, res) {
    const { chatId } = req.params;

    const chat = await Chat.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await Message.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    return res.status(200).json({
        message: "Chat deleted successfully"
    })
}