import { readFileSync } from 'fs'
import readline from 'readline'
import { google } from 'googleapis'

// Replace with the path to your credentials file
const CREDENTIALS_PATH = '/path/to/credentials.json'

// Replace with the ID of the mailbox you want to access
const MAILBOX_ID = 'me'

// Load the credentials
const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH))

// Set up the OAuth2 client
const oauth2Client = new google.auth.OAuth2(
	credentials.client_id,
	credentials.client_secret,
	credentials.redirect_uris[0]
)
oauth2Client.setCredentials(credentials.tokens)

// Set up the Gmail API
const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

// List all messages in the mailbox
gmail.users.messages.list({ userId: MAILBOX_ID }, (err, res) => {
	if (err) {
		console.error(err)
		return
	}
	console.log(res.data)
})
