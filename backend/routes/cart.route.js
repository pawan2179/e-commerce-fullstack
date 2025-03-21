import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateQuantity, getCartProducts, addToCard, removeAllFromCart } from "../controllers/cart.controller.js";
const router = express.Router();

router.get('/', protectRoute, getCartProducts);
router.post('/', protectRoute, addToCard);
router.delete('/', protectRoute, removeAllFromCart);
router.put('/:id', protectRoute, updateQuantity);

export default router;