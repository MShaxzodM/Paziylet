import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import multerS3 from "multer-s3";
import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";

// local imports:
import { Auth } from "../auth";
import { deleteFile, getObjectSignedUrl } from "../S3/s3";

//there is our creations
const prisma = new PrismaClient();
const router = Router();

// Post a Post

const region = "us-east-1";
const accessKeyId = process.env.ACCESS_KEY_ID as string;
const secretAccessKey = process.env.SECRET_KEY as string;
const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

// Multer configuration
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: "paziylet",
        metadata: async function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req: any, file, cb) {
            const extension = file.originalname.split(".").pop();
            cb(null, Date.now().toString() + "." + extension);
        },
    }),
});

// Then there is actually post method!
router.post("/", Auth, upload.array("images"), async (req, res) => {
    try {
        req.body.images = [];
        req.body.categoryId = parseInt(req.body.categoryId);
        req.body.date = new Date(req.body.date);
        const files: any = req.files;
        files.forEach((image: any) => {
            req.body.images.push(image.key);
        });
        const post = await prisma.post.create({
            data: req.body,
        });
        res.send(post);
    } catch (err) {
        res.send(err);
    }
    // const post = prisma.post.create({data:req.body})
});

//Get posts

router.get("/", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 7;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    const search = req.query.search ? req.query.search : "";
    const posts: any = await prisma.post.findMany({
        where: {
            title: {
                contains: search as string,
                mode: "insensitive",
            },
        },
        take: limit,
        skip: offset,
    });
    const updatedData = await Promise.all(
        posts.map(async (post: any) => {
            const images = await Promise.all(
                post.images.map((image: any) => {
                    return getObjectSignedUrl(image);
                })
            );
            const categoryName: any = await prisma.category.findUnique({
                where: { id: post.categoryId },
            });
            post.categoryName = categoryName.name;
            post.images = images;
            return post;
        })
    );

    res.send(updatedData);
});

// Update post:

router.put("/:id", Auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const update = await prisma.post.update({
            data: req.body,
            where: { id },
        });
        res.send(update);
    } catch (err) {
        res.send(err);
    }
});

// deleting post
router.delete("/:id", Auth, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const beDeleted: any = await prisma.post.findUnique({ where: { id } });
        beDeleted.images.forEach(async (image: any) => {
            await deleteFile(image);
        });
        const deleted = await prisma.post.delete({ where: { id } });
        res.send(deleted);
    } catch (err) {
        res.send(err);
    }
});

export default router;