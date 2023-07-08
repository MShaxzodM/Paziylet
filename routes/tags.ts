import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {
        const tag = await prisma.tag.create({ data: req.body });
        res.send(tag);
    } catch (err) {
        res.send(err);
    }
});

router.get("/", async (req, res) => {
    try {
        const tags = await prisma.tag.findMany();
        res.send(tags);
    } catch (err) {
        res.send(err);
    }
});
export default router;
