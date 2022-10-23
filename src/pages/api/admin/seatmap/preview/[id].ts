import { NextApiRequest, NextApiResponse } from "next";
import { serverAuthenticate } from "../../../../../constants/serverUtil";
import { PermissionSection, PermissionType } from "../../../../../constants/interfaces";
import { IncomingForm } from 'formidable';
import fs from "fs";
import prisma from "../../../../../lib/prisma";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.Options,
        permissionType: PermissionType.Read
    });
    if (!user) return;

    const { id } = req.query;
    if (!id) {
        res.status(400).end("Please provide an seat map id!");
        return;
    }
    let parsedId = parseInt(id as string);
    const seatMap = await prisma.seatMap.findUnique({
        where: {
            id: parsedId
        }
    });
    if (!seatMap)
        return res.status(404).end("Seat map not found!");

    if (req.method === "POST") {
        const data: {fields, files} = await new Promise((resolve, reject) => {
            const form = new IncomingForm();
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });
        const file = data.files.file;
        if (!file)
            return res.status(400).end("Missing file");
        const fileData = await fs.promises.readFile(file.filepath);
        await prisma.seatMap.update({
            where: {
                id: parsedId
            },
            data: {
                preview: fileData,
                previewType: file.mimetype
            }
        });
        return res.status(200).end("Updated");
    }
    if (req.method === "DELETE") {
        await prisma.seatMap.update({
            where: {
                id: parsedId
            },
            data: {
                preview: null,
                previewType: null
            }
        });
        return res.status(200).end("Deleted");
    }

    res.status(400).end("Method not allowed");
}

export const config = {
    api: {
        bodyParser: false,
    }
};
