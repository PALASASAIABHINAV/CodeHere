import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Check, Loader, User } from 'lucide-react';

const ProfilePictureUpload = ({ currentPicture, onUploadSuccess, canDelete = true }) => {
    const [preview, setPreview] = useState(currentPicture);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setError('');
        setSuccess('');

        setUploading(true);
        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await fetch('http://localhost:5000/api/profile/upload-picture', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Profile picture uploaded successfully!');
                setPreview(data.user.profile_picture_url);
                if (onUploadSuccess) onUploadSuccess(data.user.profile_picture_url);
            } else {
                setError(data.message || 'Upload failed');
                setPreview(currentPicture);
            }
        } catch (err) {
            setError('Failed to upload image');
            setPreview(currentPicture);
        } finally {
            setUploading(false);
        }
    }, [currentPicture, onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        multiple: false
    });

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

        try {
            const response = await fetch('http://localhost:5000/api/profile/delete-picture', {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (data.success) {
                setPreview(null);
                setSuccess('Profile picture deleted');
                if (onUploadSuccess) onUploadSuccess(null);
            } else {
                setError(data.message || 'Failed to delete');
            }
        } catch (err) {
            setError('Failed to delete image');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-center">
                <div className="relative">
                    {preview ? (
                        <img
                            src={preview}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                        />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <User className="w-16 h-16 text-white" />
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <Loader className="w-8 h-8 text-white animate-spin" />
                        </div>
                    )}
                </div>
            </div>

            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                {isDragActive ? (
                    <p className="text-blue-600 font-medium">Drop the image here...</p>
                ) : (
                    <div>
                        <p className="text-gray-700 font-medium mb-1">
                            {preview ? 'Click to change your photo' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-sm text-gray-500">
                            JPG, PNG or WebP (max. 5MB)
                        </p>
                    </div>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <X className="w-4 h-4" />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    <Check className="w-4 h-4" />
                    {success}
                </div>
            )}

            {preview && canDelete && (
                <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                >
                    <X className="w-4 h-4" />
                    Delete Profile Picture
                </button>
            )}
        </div>
    );
};

export default ProfilePictureUpload;
