const router = require("express").Router();
const { protect } = require("../middleware/auth");
const { albumAccess } = require("../middleware/albumAccess")
const { createAlbum, getAlbums, updateAlbum, deleteAlbum, shareAlbum, getAlbumById } = require("../controllers/album.controller");

router.use(protect);

router.post("/", createAlbum);
router.get("/", getAlbums);
router.get("/:albumId", albumAccess("read"), getAlbumById);
router.put("/:albumId", albumAccess("owner"), updateAlbum);
router.delete("/:albumId", albumAccess("owner"), deleteAlbum);
router.post("/:albumId/share", albumAccess("owner"), shareAlbum);


module.exports = router;