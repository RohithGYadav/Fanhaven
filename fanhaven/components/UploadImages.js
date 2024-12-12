"use client"
import { CldUploadWidget } from 'next-cloudinary';
 

const UploadImages = () => {
  return (
    <CldUploadWidget uploadPreset="ml_default">
    {({ open }) => {
      return (
        <button onClick={() => open()}>
          Upload an Image
        </button>
      );
    }}
  </CldUploadWidget>
  )
}

export default UploadImages