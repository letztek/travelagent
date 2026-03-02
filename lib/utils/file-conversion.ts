/**
 * Converts a File object to a base64 string.
 * @param file - The File object to convert.
 * @returns A Promise that resolves to the base64 encoded string (including data: prefix).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}
