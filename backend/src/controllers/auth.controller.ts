import { Request, Response } from "express";
import axios from "axios";
import qs from "querystring";
import dotenv from "dotenv";
import prisma from "../prisma/client"; // Adjust the import path as necessary
dotenv.config();

const GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_INFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export const redirectToGoogle = (req: Request, res: Response) => {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const redirect_url = process.env.GOOGLE_REDIRECT_URL;

  if(!client_id || !redirect_url) {
    return res.status(500).json({ error: "Google OAuth configuration is missing" });
  }

  const params = qs.stringify({
    client_id: client_id,
    redirect_uri: redirect_url,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(' '),
    access_type: "offline",
    prompt: "consent",
  });

  const authUrl = `${GOOGLE_AUTH_BASE_URL}?${params}`;

  return res.redirect(authUrl);
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    return res.status(400).json({ error: "Authorization code not provided" });
  }

  try {
    // Exchange authorization code for access token
    const { data: tokenData } = await axios.post(
      GOOGLE_TOKEN_URL,
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URL,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token, refresh_token } = tokenData;

    // get user info
    const { data: userInfo } = await axios.get(GOOGLE_USER_INFO_URL, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { email, name, sub: googleId } = userInfo;

    // Store user in DB

    const user = await prisma.user.upsert({
      where: { googleId },
      update: {
        email,
        name,
        accessToken: access_token,
        refreshToken: refresh_token,
      },

      create: {
        googleId,
        email,
        name,
        accessToken: access_token,
        refreshToken: refresh_token,
      },
    });
    
    // Redirect to frontend with user data
    const frontendCallbackUrl = `http://localhost:3000/auth/callback?userId=${user.id}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name || '')}`;
    return res.redirect(frontendCallbackUrl);
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    return res.redirect(`http://localhost:3000?error=auth_failed`);
  }
};
