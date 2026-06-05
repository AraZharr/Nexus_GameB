const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || ''

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`

/**
 * Upload file to Cloudinary (unsigned preset)
 * @param {File} file - File to upload
 * @param {object} options - Upload options
 * @param {string} options.folder - Cloudinary folder
 * @param {number} options.maxSizeKB - Max size in KB (default 500)
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadToCloudinary(file, options = {}) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local')
  }

  const maxSizeKB = options.maxSizeKB || 500

  // Compress image if too large
  let processedFile = file
  if (file.size > maxSizeKB * 1024) {
    processedFile = await compressImage(file, maxSizeKB)
  }

  const formData = new FormData()
  formData.append('file', processedFile)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', options.folder || 'nexus-board')

  if (options.transformation) {
    formData.append('transformation', options.transformation)
  }

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Upload failed')
  }

  const data = await response.json()

  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  }
}

/**
 * Compress image client-side using Canvas
 * @param {File} file - Image file
 * @param {number} maxSizeKB - Target max size in KB
 * @returns {Promise<File>}
 */
async function compressImage(file, maxSizeKB) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img
      const maxDimension = 1200

      // Scale down if too large
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size <= maxSizeKB * 1024) {
            resolve(new File([blob], file.name, { type: 'image/webp' }))
          } else if (blob) {
            // Further compress by reducing quality
            canvas.toBlob(
              (smallerBlob) => {
                resolve(new File([smallerBlob || blob], file.name, { type: 'image/webp' }))
              },
              'image/webp',
              0.6
            )
          } else {
            resolve(file)
          }
        },
        'image/webp',
        0.8
      )
    }

    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transform options
 * @returns {string}
 */
export function getOptimizedUrl(url, options = {}) {
  if (!url || !url.includes('cloudinary')) return url

  const { width, height, quality = 'auto', format = 'auto' } = options
  const transforms = []

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  transforms.push(`q_${quality}`)
  transforms.push(`f_${format}`)

  const transformStr = transforms.join(',')

  return url.replace('/upload/', `/upload/${transformStr}/`)
}

/**
 * Get avatar URL with face detection crop
 * @param {string} url - Original URL
 * @param {number} size - Target size
 * @returns {string}
 */
export function getAvatarUrl(url, size = 100) {
  if (!url) return null
  return getOptimizedUrl(url, { width: size, height: size, quality: 'auto' })
}

export const cloudinaryConfig = {
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET,
}
