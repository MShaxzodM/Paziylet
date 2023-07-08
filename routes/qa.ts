import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    const question = await prisma.qA.create({ data: req.body });
    res.send(question);
});

router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 7;
        const offset = req.query.offset
            ? parseInt(req.query.offset as string)
            : 0;
        const search = req.query.search ? req.query.search : "";
        const questions = await prisma.qA.findMany({
            where: {
                question: {
                    contains: search as string,
                    mode: "insensitive",
                },
            },
            take: limit,
            skip: offset,
        });
        const count = await prisma.qA.count();
        res.send({ count, questions });
    } catch (err) {
        res.send(err);
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const question = await prisma.qA.findUnique({
            where: { id: id },
        });
        res.send(question);
    } catch (err) {
        res.send(err);
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const answer = await prisma.qA.update({
            data: req.body,
            where: { id },
        });
        res.send(answer);
    } catch (err) {
        res.send(err);
    }
});
export default router;
