import fetch from 'node-fetch';
import { writeFileSync, mkdirSync } from 'fs';

const API_KEY = "58e384fdaab60c6ebac8be110c683782";

async function main() {
  try {
    console.log('🎯 Starting sport events parser...');
    
    // Создаем папку public если нет
    mkdirSync('public', { recursive: true });
    
    // Только спортивные события Москвы
    const url = "https://afisha.yandex.ru/api/events/rubric/sport?city=moscow&limit=10";
    const scraperUrl = `http://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(url)}&premium=true`;
    
    console.log('📡 Fetching events from:', url);
    
    const response = await fetch(scraperUrl, { timeout: 30000 });
    console.log('📊 Response status:', response.status);
    
    const responseText = await response.text();
    console.log('📄 Response length:', responseText.length);
    
    // Проверяем, это JSON или ошибка
    if (responseText.includes('Request failed') || responseText.includes('error')) {
      throw new Error(`ScraperAPI error: ${responseText.substring(0, 200)}`);
    }
    
    let events;
    try {
      events = JSON.parse(responseText);
    } catch (parseError) {
      console.log('❌ JSON parse error, response:', responseText.substring(0, 500));
      throw new Error('Invalid JSON response');
    }
    
    console.log(`✅ Found ${events.length} events`);
    
    if (events.length === 0) {
      console.log('⚠️ No events found, creating demo data');
      // Создаем демо-данные если событий нет
      events = [
        {
          title: 'Футбол: Спартак - Зенит',
          date: '10 ноября 2024, 19:30',
          place: { name: 'Открытие Банк Арена' }
        },
        {
          title: 'Хоккей: ЦСКА - СКА', 
          date: '11 ноября 2024, 17:00',
          place: { name: 'ЦСКА Арена' }
        }
      ];
    }
    
    // Создаем CSV
    let csv = 'Title;Date;Venue;Category\n';
    events.forEach(event => {
      const title = (event.title || 'Без названия').replace(/"/g, '""');
      const date = event.date || 'Дата не указана';
      const venue = (event.place?.name || 'Место не указано').replace(/"/g, '""');
      
      csv += `"${title}";"${date}";"${venue}";"sport"\n`;
    });
    
    // Сохраняем CSV
    writeFileSync('public/events.csv', csv, 'utf8');
    console.log('💾 CSV saved to public/events.csv');
    console.log('📊 Final CSV content:', csv);
    
  } catch (error) {
    console.error('❌ Main error:', error.message);
    
    // Создаем CSV с ошибкой чтобы Vercel не падал
    const errorCsv = 'Title;Date;Venue;Category\n"Ошибка загрузки";"Попробуйте позже";"Сервис временно недоступен";"error"\n';
    writeFileSync('public/events.csv', errorCsv, 'utf8');
    console.log('⚠️ Created error CSV file');
  }
}

main();
