import { Router } from "express";
import { sendMessage, getChats, getMessages, deleteChat } from "../controllers/chat.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js"
import { sendMessageValidator } from "../validators/chat.validator.js";


const chatRouter = Router();

/**
 * @route POST /api/chats/message
 * @desc Send a message (creates a new chat if chatId is omitted)
 * @access Private
 * @body {message, chatId}
 */
chatRouter.post("/message", authMiddleware, sendMessageValidator, sendMessage)

chatRouter.get("/", authMiddleware, getChats)
chatRouter.get("/:chatId/messages", authMiddleware, getMessages)
chatRouter.delete("/delete/:chatId", authMiddleware, deleteChat)

export default chatRouter;