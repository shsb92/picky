import { FileDB, FileMetadata } from '@/types/file';
import { promises as fs } from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function initializeDB() {
    try {
        await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true });
        await fs.mkdir(UPLOADS_DIR, { recursive: true });

        try {
            await fs.access(DB_PATH);
        } catch {
            await fs.writeFile(DB_PATH, JSON.stringify({ files: [] }));
        }
    } catch (error) {
        console.error('Error initializing DB:', error);
        throw error;
    }
}

export async function getDB(): Promise<FileDB> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading DB:', error);
        throw error;
    }
}

export async function saveDB(db: FileDB) {
    try {
        await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
    } catch (error) {
        console.error('Error saving DB:', error);
        throw error;
    }
}

export async function addFile(metadata: FileMetadata) {
    const db = await getDB();
    db.files.push(metadata);
    await saveDB(db);
    return metadata;
} 