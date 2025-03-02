import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface Props {
    params: Promise<{
        path: string[]
    }>
}

export async function GET(_: Request, { params }: Props) {
    const resolvedParams = await params;
    try {
        const filePath = path.join(process.cwd(), 'public', 'uploads', ...resolvedParams.path);
        const fileBuffer = await fs.readFile(filePath);
        
        const ext = path.extname(filePath).toLowerCase();
        const contentType = ext === '.jpg' || ext === '.jpeg' 
            ? 'image/jpeg' 
            : 'image/png';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch (error) {
        console.error('Error serving image:', error);
        return new NextResponse('Image not found', { status: 404 });
    }
} 