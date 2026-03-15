import { createKavach } from 'kavach'
import { getAdapter, getActions, getLogWriter } from '@kavach/adapter-firebase'
import { getLogger } from '@kavach/logger'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth{{emulatorImport}} } from 'firebase/auth'

const app = initializeApp({
	apiKey: {{apiKey}},
	projectId: {{projectId}},
	appId: {{appId}}
})
const db = getFirestore(app)
const auth = getAuth(app)
{{emulatorBlock}}
const adapter = getAdapter(auth)
const data = () => getActions(db)
const writer = getLogWriter(db, { collection: '{{logCollection}}' })
const logger = getLogger(writer, { level: '{{logLevel}}' })

export const kavach = createKavach(adapter, {
	data,
	logger,
	app: {{app}},
	rules: {{rules}}
})
export { adapter, logger }
