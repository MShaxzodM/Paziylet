import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
    try {
        req.body.date = new Date(req.body.date);
        const hadis = await prisma.hadis.create({ data: req.body });
        res.send(hadis);
    } catch (err) {
        res.send(err);
    }
});
router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 7;
        const offset = req.query.offset
            ? parseInt(req.query.offset as string)
            : 0;
        const date = req.query.date ? (req.query.date as string) : "%";
        const hadis =
            await prisma.$queryRaw`select * from "Hadis" where text(date) ILIKE ${date} ORDER BY date desc LIMIT ${limit} OFFSET ${offset}`;
        const count = await prisma.hadis.count();
        res.send({ count, hadis });
    } catch (err) {
        res.send(err);
    }
});

router.patch("/", async (req, res) => {
    try {
        const id = parseInt(req.body.id);
        const update = await prisma.hadis.update({
            data: req.body,
            where: { id: id },
        });
        res.send(update);
    } catch (err) {
        res.send(err);
    }
});

router.delete("/", async (req, res) => {
    try {
        const id = parseInt(req.body.id);
        const deleted = await prisma.hadis.delete({ where: { id: id } });
        res.send(deleted);
    } catch (err) {
        res.send(err);
    }
});
export default router;
