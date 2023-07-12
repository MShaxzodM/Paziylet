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
// post posts
router.post("/", upload.array("images"), async (req, res) => {
    try {
        req.body.images = [];
        const tags = req.body.tags.split(",");
        req.body.tags = tags.map((tag: any) => parseInt(tag));
        req.body.categoryId = parseInt(req.body.categoryId);

        req.body.date = new Date(req.body.date);
        const files: any = req.files;
        files.forEach((image: any) => {
            req.body.images.push(image.key);
        });
        console.log(req.body);
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
    const catid = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : 0;
    const posts: any = await prisma.post.findMany({
        where: {
            title: {
                contains: search as string,
                mode: "insensitive",
            },
            ...(catid ? { categoryId: catid } : {}),
        },
        take: limit,
        skip: offset,
    });
    const Posts = await Promise.all(
        posts.map(async (post: any) => {
            const images = await Promise.all(
                post.images.map((image: any) => {
                    return getObjectSignedUrl(image);
                })
            );
            const tags = await Promise.all(
                post.tags.map(async (tag: any) => {
                    const newtag: any = await prisma.tag.findUnique({
                        select: {
                            name: true,
                        },
                        where: {
                            id: tag,
                        },
                    });
                    return newtag.name;
                })
            );
            const categoryName: any = await prisma.category.findUnique({
                where: { id: post.categoryId },
            });
            post.date = new Date(post.date).toISOString().split("T")[0];
            post.categoryName = categoryName.name;
            post.images = images;
            post.tags = tags;
            return post;
        })
    );
    const count = await prisma.post.count();
    res.send({ count, Posts });
});
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const post: any = await prisma.post.findUnique({
        where: {
            id: id,
        },
    });

    const images = await Promise.all(
        post.images.map((image: any) => {
            return getObjectSignedUrl(image);
        })
    );
    const categoryName: any = await prisma.category.findUnique({
        where: { id: post.categoryId },
    });
    post.date = new Date(post.date).toISOString().split("T")[0];
    post.categoryName = categoryName.name;
    post.images = images;
    const views = parseInt(post.views + 1);
    await prisma.post.update({ data: { views: views }, where: { id } });

    res.send(post);
});
// Update post:

router.put("/:id", async (req, res) => {
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
router.delete("/:id", async (req, res) => {
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
