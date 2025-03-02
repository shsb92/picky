import { NextResponse } from "next/server"
import sharp from "sharp"
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { promises as fs } from 'fs'
import { initializeDB, addFile, getDB, saveDB } from '@/utils/db'
import { FileMetadata } from '@/types/file'

initializeDB().catch(console.error)

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

export async function GET() {
    try {
        const db = await getDB();
        return NextResponse.json(db.files, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: `Error retrieving files: ${error}` },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: "File must be an image" },
                { status: 400 }
            );
        }

        const fileId = uuidv4();
        const originalExt = path.extname(file.name);
        const originalFilename = `${fileId}_original${originalExt}`;
        const compressedFilename = `${fileId}_compressed.jpg`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const originalPath = path.join(UPLOADS_DIR, originalFilename);
        await fs.writeFile(originalPath, buffer);

        const compressedBuffer = await sharp(buffer)
            .jpeg({ quality: 80 })
            .toBuffer();
        const compressedPath = path.join(UPLOADS_DIR, compressedFilename);
        await fs.writeFile(compressedPath, compressedBuffer);

        const metadata: FileMetadata = {
            id: fileId,
            originalName: file.name,
            originalSize: file.size,
            compressedSize: compressedBuffer.length,
            originalPath: `/api/uploads/${originalFilename}`,
            compressedPath: `/api/uploads/${compressedFilename}`,
            mimeType: file.type,
            createdAt: new Date().toISOString()
        }

        await addFile(metadata);

        return NextResponse.json({
            message: "Image processed successfully",
            file: metadata
        }, { status: 200 });
    } catch (error) {
        console.error('Error processing image:', error)
        return NextResponse.json(
            { error: "Error processing image" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const db = await getDB();
        
        const file = db.files.find(file => file.id === id);
        if (!file) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const originalFilename = file.originalPath.split('/').pop();
        const compressedFilename = file.compressedPath.split('/').pop();

        if (!originalFilename || !compressedFilename) {
            throw new Error("Invalid file paths");
        }

        const originalPath = path.join(UPLOADS_DIR, originalFilename);
        const compressedPath = path.join(UPLOADS_DIR, compressedFilename);
        
        await fs.unlink(originalPath);
        await fs.unlink(compressedPath);

        db.files = db.files.filter(f => f.id !== id);
        await saveDB(db);

        return NextResponse.json({ message: "File deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: "Error deleting file" },
            { status: 500 }
        );
    }
}

