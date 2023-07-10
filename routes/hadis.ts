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
        const date = req.query.date ? (req.query.date as string) : "";
        const hadis =
            await prisma.$queryRaw`select * from "Hadis" where text(date)=${date}`;
        res.send(hadis);
    } catch (err) {
        res.send(err);
    }
});

export default router;
