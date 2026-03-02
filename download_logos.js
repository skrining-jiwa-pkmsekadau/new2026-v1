import https from 'https';
import fs from 'fs';

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://id.wikipedia.org/'
  }
};

const dl = (url, dest) => {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let redirect = res.headers.location;
        if (!redirect.startsWith('http')) {
          redirect = new URL(redirect, 'https://upload.wikimedia.org').href;
        }
        return dl(redirect, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
};

Promise.all([
  dl('https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Lambang_Kabupaten_Sekadau.png/800px-Lambang_Kabupaten_Sekadau.png', 'public/sekadau.png'),
  dl('https://upload.wikimedia.org/wikipedia/commons/b/bf/Logo_Bakti_Husada.svg', 'public/kesehatan.svg')
]).then(() => console.log('Logos successfully downloaded.')).catch(console.error);
