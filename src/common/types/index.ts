import { Request } from "express";

export type AuthCookie = {
    accessToken: string;
};

export interface AuthRequest extends Request {
    auth: { sub: string; role: string; id?: string; tenant: string }; // the data we are sending in token
}
