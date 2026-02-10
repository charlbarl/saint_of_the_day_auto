import fs from 'fs';
import https from 'https';
import { XMLParser } from 'fast-xml-parser';

const RSS_URL = 'https://feeds.ancientfaith.com/saintoftheday';
const OUT = 'assets/data/saint_of_day.json';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  const xml = await fetch(RSS_URL);

  const parser = new XMLParser({ ignoreAttributes: false });
  const feed = parser.parse(xml);

  const items = feed.rss.channel.item;
  const today = new Date().toISOString().slice(0, 10);

  const item =
    items.find(i =>
      new Date(i.pubDate).toISOString().slice(0, 10) === today
    ) || items[0];

  const output = {
    title: item.title,
    date: today,
    audio: item.enclosure?.['@_url'] || '',
    description: item.description || ''
  };

  fs.writeFileSync(OUT, JSON.stringify(output, null, 2));
})();
