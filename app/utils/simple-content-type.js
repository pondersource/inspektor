export default function simpleContentType(str) {
  return typeof str === 'string' && str.split(';')[0].trim().toLowerCase()
    || 'application/octet-stream';
}
