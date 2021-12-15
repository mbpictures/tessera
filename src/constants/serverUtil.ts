import path from "path";
import fs from "fs";

export function getStaticAssetFile(file, options = null) {
    let basePath = process.cwd();
    if (process.env.NODE_ENV === "production") {
        basePath = path.join(basePath, ".next/server/chunks");
    }
    else {
        basePath = path.join(basePath, "src/")
    }

    const filePath = path.join(basePath, `assets/${file}`);
    return fs.readFileSync(filePath, options);
}