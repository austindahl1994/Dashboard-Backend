import { Response } from "express";

export interface Client {
  id: number;
  res: Response;
  team: number;
  player: string;
}
