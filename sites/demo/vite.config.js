import { kavach } from '@kavach/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import unocss from '@unocss/vite'

export default defineConfig({
	plugins: [kavach(), unocss(), sveltekit()]
})
