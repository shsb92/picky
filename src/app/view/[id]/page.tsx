'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FileMetadata } from '@/types/file';
import { formatFileSize } from '@/utils/formatters';
import { use } from 'react';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function ViewImage({ params }: PageProps) {
    const resolvedParams = use(params);
    const [file, setFile] = useState<FileMetadata | null>(null);

    useEffect(() => {
        const fetchFile = async () => {
            try {
                const response = await fetch('/api/v1/file');
                const files = await response.json();
                const foundFile = files.find((f: FileMetadata) => f.id === resolvedParams.id);
                if (foundFile) {
                    setFile(foundFile);
                }
            } catch (error) {
                console.error('Error fetching file:', error);
            }
        };

        fetchFile();
    }, [resolvedParams.id]);

    if (!file) {
        return <div className="min-h-screen p-8 flex items-center justify-center">Loading...</div>;
    }

    const compressionRatio = ((file.originalSize - file.compressedSize) / file.originalSize * 100).toFixed(1);

    return (
        <div className="min-h-screen p-8">
            <main className="max-w-6xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">{file.originalName}</h1>
                    <Link 
                        href="/"
                        className="px-4 py-2 bg-violet-100 text-violet-700 rounded-full hover:bg-violet-200 transition-colors"
                    >
                        Back to Gallery
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Original</h2>
                        <div className="relative w-full h-[500px] border rounded-lg overflow-hidden">
                            <Image
                                src={file.originalPath}
                                alt="Original image"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            Size: {formatFileSize(file.originalSize)}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Compressed</h2>
                        <div className="relative w-full h-[500px] border rounded-lg overflow-hidden">
                            <Image
                                src={file.compressedPath}
                                alt="Compressed image"
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                        <p className="text-sm text-gray-600">
                            Size: {formatFileSize(file.compressedSize)}
                        </p>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">Compression Details</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Space saved: {formatFileSize(file.originalSize - file.compressedSize)} ({compressionRatio}% reduction)
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Uploaded on: {new Date(file.createdAt).toLocaleString()}
                    </p>
                </div>
            </main>
        </div>
    );
} 