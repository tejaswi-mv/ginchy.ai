// API route for handling signup form submissions
// This example shows how to connect to Google Sheets

import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Google Sheets integration
    // You'll need to set up a Google Service Account and share your sheet with the service account email
    
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Add the email to the Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:B', // Adjust range as needed
      valueInputOption: 'RAW',
      resource: {
        values: [[email, new Date().toISOString()]],
      },
    });

    // Optional: Send confirmation email or add to email marketing service
    // Example with a service like SendGrid, Mailchimp, etc.
    
    return res.status(200).json({ 
      message: 'Successfully signed up!',
      success: true 
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // For development, you might want to log the email instead of failing
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - would have saved email:', email);
      return res.status(200).json({ 
        message: 'Successfully signed up! (Development mode)',
        success: true 
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to process signup. Please try again.' 
    });
  }
}

/* 
SETUP INSTRUCTIONS FOR GOOGLE SHEETS INTEGRATION:

1. Create a Google Cloud Project:
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing one

2. Enable Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API" and enable it

3. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create

4. Generate Service Account Key:
   - Click on your service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key" > "JSON"
   - Download the JSON file

5. Create a Google Sheet:
   - Create a new Google Sheet
   - Share it with your service account email (found in the JSON file)
   - Give "Editor" permissions

6. Set Environment Variables:
   Add these to your .env.local file:
   
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_PRIVATE_KEY_ID=your-private-key-id
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_SHEET_ID=your-google-sheet-id

7. Install the googleapis package:
   npm install googleapis

8. Test the integration:
   - Submit the form and check your Google Sheet
   - The email and timestamp should appear in the sheet
*/
