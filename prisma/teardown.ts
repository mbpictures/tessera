import { exec } from 'child_process';
import * as util from 'util';

const execPromisify = util.promisify(exec);

export async function main() {
    await execPromisify('npx prisma migrate reset --force --skip-seed');
    await execPromisify('npx prisma db push');
}
