export const getDirectImageUrl = (url) => {
  if (!url) return '';
  
  let id = '';
  if (url.includes('drive.google.com/file/d/')) {
    id = url.split('/d/')[1].split('/')[0];
  } else if (url.includes('drive.google.com/open?id=')) {
    id = url.split('id=')[1].split('&')[0];
  } else if (url.includes('drive.google.com/uc?id=')) {
    id = url.split('id=')[1].split('&')[0];
  }

  if (id) {
    return `https://lh3.googleusercontent.com/d/${id}`;
  }
  
  return url;
};
