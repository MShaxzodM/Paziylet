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
router.patch("/", async (req, res) => {
    try {
        const id = parseInt(req.body.id);
        const updated = await prisma.tag.update({
            data: req.body,
            where: { id: id },
        });
        res.send(updated);
    } catch (err) {
        res.send(err);
    }
});
router.delete("/", async (req, res) => {
    try {
        const id = parseInt(req.body.id);
        const deleted = await prisma.tag.delete({ where: { id: id } });
        res.send(deleted);
    } catch (err) {
        res.send(err);
    }
});
export default router;
