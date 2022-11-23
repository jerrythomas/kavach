import { logger } from '$lib'

/** @type {import('./$types').PageLoad} */
export async function load({ url }) {
	await logger.info({
		module: '/page.js',
		method: 'load',
		url_path: url.pathname
	})
	return {
		name: 'vijay',
		assignedToId: '1fbdbec1-4fa3-44f4-8ba6-7a77c30f971c',
		dueDate: '2022-08-08T18:30:00.000Z',
		questions: [
			{
				contentUrl:
					'https://s3.ap-south-1.amazonaws.com/sg.cb.dev/contentManagement/demo/task/eyeGaze/Eye_Gaze_SE0003_option01.png',
				questionId: 1,
				question: 'What is Tanya looking at?',
				customAnswers: ['all'],
				displayTypeId: '2c81b4dd-85c9-4950-a649-c20679b9b1c0',
				answers: ['Ball', 'Bal', 'Bol'],
				audioTypeId: '4fdfc0ee-cdb6-44ca-a0e5-1c3f0cab9865',
				prompt: 'Say ball',
				contentType: 'image'
			}
		]
	}
}
