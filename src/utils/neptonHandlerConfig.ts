export type ProjectConfig = {
	id: string
	name: string
	projectId: string
	code?: string
}

export type NeptonHandlerConfig = {
	projectConfigs: ProjectConfig[]
	defaultProjectId: string | null
	favoriteEnabled: boolean
	selectedProjectId: string
}

export function parseNeptonHandlerConfig(value: unknown): NeptonHandlerConfig {
	if (typeof value !== 'object' || value === null) {
		throw new Error('Configuration must be an object')
	}

	const config = value as Record<string, unknown>
	if (
		!Array.isArray(config.projectConfigs) ||
		typeof config.favoriteEnabled !== 'boolean' ||
		(config.defaultProjectId !== null &&
			typeof config.defaultProjectId !== 'string') ||
		typeof config.selectedProjectId !== 'string'
	) {
		throw new Error('Configuration has invalid fields')
	}

	const projectConfigs = config.projectConfigs.map((project) => {
		if (typeof project !== 'object' || project === null) {
			throw new Error('Configuration has an invalid project')
		}

		const projectConfig = project as Record<string, unknown>
		if (
			typeof projectConfig.id !== 'string' ||
			typeof projectConfig.name !== 'string' ||
			typeof projectConfig.projectId !== 'string' ||
			(projectConfig.code !== undefined &&
				typeof projectConfig.code !== 'string')
		) {
			throw new Error('Configuration has an invalid project')
		}

		return {
			id: projectConfig.id,
			name: projectConfig.name,
			projectId: projectConfig.projectId,
			...(projectConfig.code !== undefined ? { code: projectConfig.code } : {}),
		}
	})

	const projectIds = new Set(projectConfigs.map((project) => project.id))
	if (projectIds.size !== projectConfigs.length) {
		throw new Error('Configuration has duplicate project IDs')
	}
	if (config.selectedProjectId && !projectIds.has(config.selectedProjectId)) {
		throw new Error('Configuration references a missing selected project')
	}
	if (
		config.defaultProjectId !== null &&
		!projectIds.has(config.defaultProjectId)
	) {
		throw new Error('Configuration references a missing default project')
	}

	const defaultProjectId = config.favoriteEnabled
		? config.defaultProjectId
		: null
	const selectedProjectId = config.favoriteEnabled
		? (defaultProjectId ?? '')
		: config.selectedProjectId

	return {
		projectConfigs,
		defaultProjectId,
		favoriteEnabled: config.favoriteEnabled,
		selectedProjectId,
	}
}
