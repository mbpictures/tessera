import {GoogleAuth} from "google-auth-library";
import jwt from "jsonwebtoken";
import { encodeTicketQR, getEventTitle } from "../constants/util";

const objectUrl = 'https://walletobjects.googleapis.com/walletobjects/v1/eventTicketObject/';

const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID;
const classId = process.env.GOOGLE_WALLET_CLASS_ID;

const getObjectId = (ticketId) => {
    return `${issuerId}.${ticketId}-${classId}`;
}

const getPayload = (eventDate, ticket) => {
    const imageModulesDate = [];
    if (eventDate.event.coverImage) {
        imageModulesDate.push({
            "mainImage": {
                "kind": "walletobjects#image",
                "sourceUri": {
                    "kind": "walletobjects#uri",
                    "uri": process.env.NEXT_PUBLIC_SHOP_DOMAIN + eventDate.event.coverImage,
                    "description": "Test image module description"
                }
            }
        })
    }
    return {
        "id": getObjectId(ticket.id),
        "classId": `${issuerId}.${classId}`,
        "textModulesData": [
            {
                "header": "Event",
                "body": getEventTitle(eventDate)
            }
        ],
        "imageModulesData": imageModulesDate,
        "barcode": {
            "kind": "walletobjects#barcode",
            "type": "qrCode",
            "value": encodeTicketQR(ticket.id, ticket.secret)
        },
        "state": "active",
        "seatInfo": {
            "kind": "walletobjects#eventSeat",
            "seat": {
                "kind": "walletobjects#string",
                "defaultValue": {
                    "kind": "walletobjects#string",
                    "language": "en-us",
                    "value": ticket.seatId?.toString() ?? ticket.category.label
                }
            }
        },
        "ticketHolderName": `${ticket.firstName ?? ticket.order.user.firstName} ${ticket.lastName ?? ticket.order.user.lastName}`,
        "ticketNumber": ticket.id
    };
};

const getCredentials = () => {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        let credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64)
            credentials = Buffer.from(credentials, "base64").toString();
        return JSON.parse(credentials);
    }
    return {
        private_key: process.env.GOOGLE_APPLICATION_CREDENTIALS_PRIVATE_KEY.replace(/\\n/g, ''),
        client_email: process.env.GOOGLE_APPLICATION_CREDENTIALS_CLIENT_EMAIL
    }
};

export const getGoogleWalletTicketLink = async (eventDate, ticket) => {
    const credentials = getCredentials();
    const objectId = getObjectId(ticket.id);
    const httpClient = new GoogleAuth({
        credentials: credentials,
        scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
    });

    try {
        await httpClient.request({
            url: objectUrl + objectId,
            method: 'GET'
        });
    } catch (err) {
        if (err.response && err.response.status === 404) {
            await httpClient.request({
                url: objectUrl,
                method: 'POST',
                data: getPayload(eventDate, ticket)
            });
        } else {
            throw Error(err);
        }
    }

    return {
        objectId: objectId,
        link: getGoogleWalletTicketLinkFromObjectId(objectId)
    }
}

export const getGoogleWalletTicketLinkFromObjectId = (objectIds: string | string[]) => {
    if (typeof objectIds === "string") {
        objectIds = [objectIds];
    }
    const credentials = getCredentials();
    const claims = {
        iss: credentials.client_email,
        aud: 'google',
        origins: [process.env.NEXT_PUBLIC_SHOP_DOMAIN],
        typ: 'savetowallet',
        payload: {
            genericObjects: objectIds.map(objectId => ({id: objectId})),
        }
    };
    const token = jwt.sign(claims, credentials.private_key, {algorithm: "RS256"});
    return `https://pay.google.com/gp/v/save/${token}`
};

export const validateConfiguration = () => {
    const credentials = getCredentials();
    return credentials.client_email !== undefined && credentials.private_key !== undefined && issuerId !== undefined && classId !== undefined && process.env.NEXT_PUBLIC_SHOP_DOMAIN !== undefined;
}
