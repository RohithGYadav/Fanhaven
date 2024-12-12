// "use client"
// import { useState } from 'react';

// export default function UploadForm() {
//   const [file, setFile] = useState(null);
//   const [imageUrl, setImageUrl] = useState('');

//   const handleFileChange = (event) => {
//     setFile(event.target.files[0]);
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (!file) {
//       alert('Please select a file to upload.');
//       return;
//     }

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', 'your_upload_preset'); // Replace with your upload preset

//     try {
//       const response = await fetch('https://api.cloudinary.com/v1_1/your_cloud_name/image/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();
//       if (response.ok) {
//         setImageUrl(result.secure_url);
//       } else {
//         alert(result.error.message || 'Upload failed');
//       }
//     } catch (error) {
//       alert('An error occurred during the upload');
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input type="file" onChange={handleFileChange} />
//         <button type="submit">Upload</button>
//       </form>
//       {imageUrl && <img src={imageUrl} alt="Uploaded" />}
//     </div>
//   );
// }
'use client';

import { useState } from 'react';

export default function TestUpload() {
  const [media, setMedia] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mediaURL, setMediaURL] = useState('');

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    setMedia(file);

    // Preview the media
    const reader = new FileReader();
    reader.onloadend = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!media) {
      alert('Please select a media file to upload.');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', media); // Ensure the field name 'file' matches multer

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Media uploaded:', data.secure_url);
        setMediaURL(data.secure_url);
      } else {
        console.error('Media upload failed:', data.error);
        alert(`Media upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Error uploading media');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Cloudinary Media Upload</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} />
        {mediaPreview && (
          <div style={{ marginTop: '10px' }}>
            {media?.type?.startsWith('video') ? (
              <video controls src={mediaPreview} width={200} />
            ) : (
              <img src={mediaPreview} alt="Preview" width={200} />
            )}
          </div>
        )}
        <button type="submit" disabled={uploading} style={{ display: 'block', marginTop: '10px' }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {mediaURL && (
        <div>
          <h2>Uploaded Media</h2>
          <p>{mediaURL}</p>
          {media?.type?.startsWith('video') ? (
            <video controls src={mediaURL} width={400} />
          ) : (
            <img src={mediaURL} alt="Uploaded" width={400} />
          )}
        </div>
      )}
    </div>
  );
}
