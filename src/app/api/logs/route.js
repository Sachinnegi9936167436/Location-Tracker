import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'locations.json');

export async function GET() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      return NextResponse.json([]);
    }

    const fileContent = fs.readFileSync(LOG_FILE, 'utf8');
    const logs = JSON.parse(fileContent);

    // Return logs sorted by timestamp descending
    return NextResponse.json(logs.reverse());
  } catch (error) {
    console.error('Fetch Logs Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
