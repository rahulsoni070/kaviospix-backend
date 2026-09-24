const { loadImage } = require("../middleware/imageAccess");
const router = require("express").Router({ mergeParams: true });
const { protect } = require("../middleware/auth");
const { albumAccess } = require("../middleware/albumAccess");
const upload = require("../middleware/upload");
const { uploadImage, getImages, getFavoriteImages, toggleFavorite, addComment, deleteImage } = require("../controllers/image.controller");

router.use(protect);

router.post("/", albumAccess("owner"), upload.single("image"), uploadImage);
router.get("/", albumAccess("read"), getImages);
router.get("/favorites", albumAccess("read"), getFavoriteImages)
router.put("/:imageId/favorite", albumAccess("owner"), loadImage, toggleFavorite);
router.post("/:imageId/comments", albumAccess("read"), loadImage, addComment);
router.delete("/:imageId",         albumAccess("owner"), loadImage, deleteImage);

module.exports = router;