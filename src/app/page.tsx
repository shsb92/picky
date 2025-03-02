'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileMetadata } from '@/types/file';
import ImageCard from './components/ImageCard';

export default function Home() {
    const [isLoading, setIsLoading] = useState(false);
    const [files, setFiles] = useState<FileMetadata[]>([]);

    useEffect(() => {
        fetchFiles();
    }, []);

    const fetchFiles = async () => {
        try {
            const response = await fetch('/api/v1/file');
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/v1/file', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            await fetchFiles();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-8">
            <main className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Image Compression Tool</h1>
                
                <div className="mb-8">
                    <label className="block mb-4">
                        <span className="sr-only">Choose image</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-violet-50 file:text-violet-700
                                hover:file:bg-violet-100"
                        />
                    </label>
                </div>

                {isLoading && (
                    <div className="text-center py-4">Processing...</div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {files.map((file) => (
                        <ImageCard key={file.id} fileInfo={file} onDelete={fetchFiles} />
                    ))}
                </div>
            </main>
        </div>
    );
}
