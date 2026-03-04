export interface ConvexConfig {
	client: object
	providers?: {
		password?: boolean
		oauth?: string[]
		otp?: boolean
	}
}

const defaultConvexConfig: ConvexConfig = {
	client: {}
}

export default defaultConvexConfig
