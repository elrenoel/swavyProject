import { Router } from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  getLists,
  getListById,
  createList,
  updateList,
  deleteList,
  addSongToList,
  removeSongFromList,
} from "../controllers/list.controller.js";

const listRoutes = Router();

listRoutes.use(authenticate);

listRoutes.get("/", getLists);
listRoutes.post("/", createList);
listRoutes.get("/:id", getListById);
listRoutes.put("/:id", updateList);
listRoutes.delete("/:id", deleteList);
listRoutes.post("/:id/songs", addSongToList);
listRoutes.delete("/:id/songs/:songId", removeSongFromList);

export default listRoutes;
