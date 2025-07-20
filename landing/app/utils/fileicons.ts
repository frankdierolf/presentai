export function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'application/pdf':
      return 'i-ph-file-pdf';
    case 'text/html':
      return 'i-ph-file-html';
    case 'text/javascript':
    case 'application/javascript':
      return 'i-ph-file-js';
    case 'text/css':
      return 'i-ph-file-css';
    case 'application/json':
      return 'i-ph-file-json';
    case 'text/csv':
      return 'i-ph-file-csv';
    case 'text/markdown':
      return 'i-ph-file-md';
    case 'text/plain':
    case 'text/txt':
      return 'i-ph-file-txt';
    case 'application/zip':
    case 'application/x-zip-compressed':
      return 'i-ph-file-zip';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return 'i-ph-file-xls';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'i-ph-file-doc';
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    case 'application/vnd.ms-powerpoint':
      return 'i-ph-file-ppt';
    case 'video/mp4':
    case 'video/quicktime':
    case 'video/x-msvideo':
    case 'video/x-matroska':
      return 'i-ph-file-video';
    case 'audio/mpeg':
    case 'audio/wav':
    case 'audio/ogg':
    case 'audio/midi':
      return 'i-ph-file-audio';
    case 'image/jpeg':
    case 'image/jpg':
      return 'i-ph-file-jpg';
    case 'image/png':
      return 'i-ph-file-png';
    case 'image/svg+xml':
      return 'i-ph-file-svg';
    default:
      return 'i-ph-file';
  }
}
