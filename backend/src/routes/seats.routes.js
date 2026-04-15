import { bookSeats,getAllSeats } from "../controllers/seats.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import { Router } from "express";

const router = Router();

router.get("/getAllSeats", isLoggedIn, getAllSeats);
router.post("/bookSeats", isLoggedIn, bookSeats);

export { router as seatsRoutes };
