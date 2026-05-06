import { Router } from "express";
import {
  getNewReleases,
  searchTracks,
  getAlbumDetail,
  getDiscover,
} from "../controllers/spotify.controller.js";

const spotifyRoutes = Router();

spotifyRoutes.get("/new-releases", getNewReleases);
spotifyRoutes.get("/search", searchTracks);
spotifyRoutes.get("/album/:id", getAlbumDetail);
spotifyRoutes.get("/discover", getDiscover);

export default spotifyRoutes;
