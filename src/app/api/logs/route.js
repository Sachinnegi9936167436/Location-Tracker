import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Location from '@/models/Location';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('admin-password');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.warn('ADMIN_PASSWORD is not set in environment variables.');
    } else if (authHeader !== adminPassword) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    // Fetch all locations sorted by timestamp descending
    const logs = await Location.find({}).sort({ timestamp: -1 });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Fetch Logs Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
