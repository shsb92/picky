'use client';

import Image from 'next/image';
import { FileMetadata } from '@/types/file';
import { useRouter } from 'next/navigation';

interface ImageCardProps {
    fileInfo: FileMetadata;
    onDelete: () => void;
}

export default function ImageCard({ fileInfo, onDelete }: ImageCardProps) {
    const router = useRouter();
    
    return (
        <div 
        key={fileInfo.id}
        className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
        <div 
            onClick={() => router.push(`/view/${fileInfo.id}`)}
            className="cursor-pointer"
        >
            <div className="relative w-full h-48">
                <Image
                    src={fileInfo.compressedPath}
                    alt={fileInfo.originalName}
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>
            <div className="p-4">
                    <h3 className="text-sm font-semibold truncate">{fileInfo.originalName}</h3>
                <p className="text-xs text-gray-500">
                    {new Date(fileInfo.createdAt).toLocaleDateString()}
                </p>
            </div>
        </div>
        <button
            onClick={async (e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this image?')) {
                    try {
                        const response = await fetch('/api/v1/file', {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ id: fileInfo.id }),
                        });

                        if (!response.ok) throw new Error('Failed to delete');
                        onDelete();
                    } catch (error) {
                        console.error('Error deleting file:', error);
                        alert('Failed to delete file');
                    }
                }
            }}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
        >
            {/* {I let chatgpt generate the svg for me} */}
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            >
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
        </button>
    </div>
    );
}
