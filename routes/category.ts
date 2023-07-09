import { PrismaClient } from "@prisma/client";
import { Router } from "express";
//local imports

import { Auth } from "../auth";
const router = Router();
const prisma = new PrismaClient();
//code below is getting category names from category table

router.get("/", async (req, res) => {
    try {
        const data = await get_category();
        res.send(data);
    } catch (err) {
        res.send(err);
    }
});
async function get_category() {
    const users = await prisma.category.findMany();
    return users;
}

// code below is posting to category table

router.post("/", async (req, res) => {
    try {
        const category = await prisma.category.create({ data: req.body });
        res.send(category);
    } catch (err) {
        res.send(err);
    }
});

// updating category names:
router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const update = await prisma.category.update({
            where: { id },
            data: req.body,
        });
        res.send(update);
    } catch (err) {
        res.send(err);
    }
});

// deleting category by id
router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const deleted = await prisma.category.delete({
            where: { id },
        });
        res.send(deleted);
    } catch (err) {
        res.send(err);
    }
});

export default router;
