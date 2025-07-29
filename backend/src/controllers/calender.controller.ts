import { Request, Response } from "express";
import axios from "axios";
import prisma from "../prisma/client";

const GOOGLE_CALENDAR_EVENTS_URL =
  "https://www.googleapis.com/calendar/v3/calendars/primary/events";
const GOOGLE_TOKEN_REFRESH_URL = "https://oauth2.googleapis.com/token";

// Function to refresh access token
const refreshAccessToken = async (refreshToken: string) => {
  try {
    const response = await axios.post(GOOGLE_TOKEN_REFRESH_URL, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw new Error("Failed to refresh access token");
  }
};

// Helper function to get user and handle token refresh
const getUserWithValidToken = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.accessToken) {
    throw new Error("User not authenticated or access token missing");
  }

  return user;
};

export const createCalendarEvent = async (req: Request, res: Response) => {
  const { title, description, start, end } = req.body;
  
  // Get user ID from headers (for production use)
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.accessToken) {
    return res
      .status(401)
      .json({ error: "User not authenticated or access token missing" });
  }

  if (!title || !start || !end) {
    return res.status(400).json({ 
      error: "Missing required fields: title, start, and end are required" 
    });
  }

  // Validate datetime format
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return res.status(400).json({ 
      error: "Invalid date format. Use ISO 8601 format (e.g., 2025-07-30T14:00:00.000Z)" 
    });
  }

  if (endDate <= startDate) {
    return res.status(400).json({ 
      error: "End time must be after start time" 
    });
  }

  try {
    const eventBody = {
      summary: title,
      description: description || "",
      start: { dateTime: start },
      end: { dateTime: end },
    };

    let accessToken = user.accessToken;

    // Try to create event with current token
    try {
      const { data } = await axios.post(GOOGLE_CALENDAR_EVENTS_URL, eventBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return res.status(201).json({ 
        message: "Event created successfully",
        eventId: data.id, 
        htmlLink: data.htmlLink,
        event: data
      });
    } catch (tokenError: any) {
      // If token is expired (401), try to refresh it
      if (tokenError.response?.status === 401 && user.refreshToken) {
        console.log("Access token expired, refreshing...");
        
        try {
          accessToken = await refreshAccessToken(user.refreshToken);
          
          // Update user with new access token
          await prisma.user.update({
            where: { id: user.id },
            data: { accessToken }
          });

          // Retry creating the event with new token
          const { data } = await axios.post(GOOGLE_CALENDAR_EVENTS_URL, eventBody, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          });

          return res.status(201).json({ 
            message: "Event created successfully (with refreshed token)",
            eventId: data.id, 
            htmlLink: data.htmlLink,
            event: data
          });
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          return res.status(401).json({ 
            error: "Access token expired and refresh failed. Please re-authenticate." 
          });
        }
      } else {
        throw tokenError; // Re-throw if it's not a token issue
      }
    }
  } catch (err: any) {
    console.error("Error creating calendar event:", err.response?.data || err.message);
    return res.status(500).json({ 
      error: "Failed to create calendar event",
      details: err.response?.data || err.message
    });
  }
};

// Get user's calendar events
export const getCalendarEvents = async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const user = await getUserWithValidToken(userId);
    let accessToken = user.accessToken;

    const { data } = await axios.get(GOOGLE_CALENDAR_EVENTS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      params: {
        timeMin: new Date().toISOString(), // Get future events only
        maxResults: 20,
        singleEvents: true,
        orderBy: 'startTime'
      }
    });

    return res.status(200).json({
      message: "Events retrieved successfully",
      events: data.items
    });

  } catch (err: any) {
    if (err.response?.status === 401) {
      return res.status(401).json({ 
        error: "Access token expired. Please re-authenticate." 
      });
    }
    
    console.error("Error fetching calendar events:", err.response?.data || err.message);
    return res.status(500).json({ 
      error: "Failed to fetch calendar events",
      details: err.response?.data || err.message
    });
  }
};
