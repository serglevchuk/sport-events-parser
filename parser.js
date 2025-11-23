import fetch from 'node-fetch';
import { writeFileSync, mkdirSync } from 'fs';

const API_KEY = "58e384fdaab60c6ebac8be110c683782";

async function main() {
  try {
    console.log('🎯 Starting sport events parser...');
    
    // Только спортивные события Москвы на ближайшие дни
    const url = "https://afisha.yandex.ru/api/events/rubric/sport?city=moscow&limit=30";
    const scraperUrl = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(url)}`;
    
    console.log('📡 Fetching events...');
    const response = await fetch(scraperUrl);
    const events = await response.json();
    
    console.log(`✅ Found ${events.length} events`);
    
    // Создаем простой CSV
    let csv = 'Title;Date;Venue;Category\n';
    events.forEach(event => {
      const title = (event.title || '').replace(/"/g, '""');
      const date = event.date || '';
      const venue = (event.place?.name || '').replace(/"/g, '""');
      
      csv += `"${title}";"${date}";"${venue}";"sport"\n`;
    });
    
    // Создаем папку public если нет
    mkdirSync('public', { recursive: true });
    
    // Сохраняем CSV
    writeFileSync('public/events.csv', csv, 'utf8');
    console.log('💾 CSV saved to public/events.csv');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
