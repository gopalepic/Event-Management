import { createCalendarEvent, getCalendarEvents } from "../controllers/calender.controller";
import express from "express";

const router = express.Router();

// Create a new calendar event
router.post('/event', createCalendarEvent);

// Get user's calendar events
router.get('/events', getCalendarEvents);

export default router;