import { NextApiRequest, NextApiResponse } from "next";
import {
    revalidateBuild,
    serverAuthenticate
} from "../../../../constants/serverUtil";
import prisma from "../../../../lib/prisma";
import { PermissionSection, PermissionType } from "../../../../constants/interfaces";
import { IncomingForm } from 'formidable';
import fs from "fs";
import { v4 as uuid } from 'uuid';

const UPLOAD_FOLDER = "coverImages";

const deleteExisting = async (event) => {
    if (!event.coverImage) return;
    if (!fs.existsSync("public" + event.coverImage)) return;
    await fs.promises.unlink("public" + event.coverImage);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const user = await serverAuthenticate(req, res, {
        permission: PermissionSection.EventManagement,
        permissionType: PermissionType.Write
    });
    if (!user) return;

    const { eventId } = req.query;
    const event = await prisma.event.findUnique({
        where: {
            id: parseInt(eventId as string)
        }
    });

    if (!event) {
        res.status(404).end("Event not found");
        return;
    }

    if (req.method === "DELETE") {
        await deleteExisting(event);
        await prisma.event.update({
            where: {
                id: parseInt(eventId as string)
            },
            data: {
                coverImage: null
            }
        });
        await revalidateBuild(res, "/");
        res.status(200).end("Deleted");
        return;
    }

    if (req.method === "PUT") {
        const { coverImageSize } = req.query;
        await prisma.event.update({
            where: {
                id: parseInt(eventId as string)
            },
            data: {
                coverImageSize: coverImageSize === "null" ? null : parseInt(coverImageSize as string)
            }
        });
        await revalidateBuild(res, "/");
        res.status(200).end("Cover Image size stored!");

        return;
    }

    if (req.method === "POST") {
        await deleteExisting(event);
        const data: {fields, files} = await new Promise((resolve, reject) => {
            const form = new IncomingForm();
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });

        const imageFile = data.files.coverImage;
        let extension = imageFile.originalFilename.split(".");
        extension = extension[extension.length - 1];
        const imageFilename = uuid() + "." + extension;

        if (!fs.existsSync("public/" + UPLOAD_FOLDER)) {
            await fs.promises.mkdir("public/" + UPLOAD_FOLDER);
        }

        const path = UPLOAD_FOLDER + "/" + imageFilename;
        const image = await fs.promises.readFile(imageFile.filepath);
        await fs.promises.writeFile("public/" + path, image);
        await prisma.event.update({
            where: {
                id: parseInt(eventId as string)
            },
            data: {
                coverImage: "/" + path
            }
        });
        await fs.promises.unlink(imageFile.filepath);
        await revalidateBuild(res, "/");
        res.status(200).end("Cover image stored successfully!");
        return;
    }

    res.status(400).end("Method unsupported");
}

export const config = {
    api: {
        bodyParser: false,
    }
};
