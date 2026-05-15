import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all locations sorted by timestamp descending
    const logs = await Location.find({}).sort({ timestamp: -1 });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Fetch Logs Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
