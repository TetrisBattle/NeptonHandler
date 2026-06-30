import { useEffect, useState } from 'react'

export type ProjectConfig = {
	id: string
	name: string
	projectId: string
	code?: string
}

const STORAGE_KEY = 'projectConfigs'
const DEFAULT_KEY = 'defaultProjectId'

export function useProjectConfigs() {
	const [configs, setConfigs] = useState<ProjectConfig[]>([])
	const [loading, setLoading] = useState(true)
	const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null)

	useEffect(() => {
		chrome.storage.local.get([STORAGE_KEY, DEFAULT_KEY]).then((result) => {
			const stored = result[STORAGE_KEY]
			if (Array.isArray(stored)) {
				setConfigs(stored as ProjectConfig[])
			}
			const storedDefault = result[DEFAULT_KEY]
			if (typeof storedDefault === 'string') {
				setDefaultProjectId(storedDefault)
			}
			setLoading(false)
		})
	}, [])

	async function addConfig(projectId: string, name: string, code?: string) {
		const newConfig: ProjectConfig = {
			id: Date.now().toString(),
			name,
			projectId,
			...(code ? { code } : {}),
		}
		const updated = [...configs, newConfig]
		setConfigs(updated)
		await chrome.storage.local.set({ [STORAGE_KEY]: updated })
	}

	async function updateConfig(
		id: string,
		patch: Partial<Omit<ProjectConfig, 'id'>>,
	) {
		const updated = configs.map((c) => (c.id === id ? { ...c, ...patch } : c))
		setConfigs(updated)
		await chrome.storage.local.set({ [STORAGE_KEY]: updated })
	}

	async function removeConfig(id: string) {
		const updated = configs.filter((c) => c.id !== id)
		setConfigs(updated)
		await chrome.storage.local.set({ [STORAGE_KEY]: updated })
		if (defaultProjectId === id) {
			setDefaultProjectId(null)
			await chrome.storage.local.remove(DEFAULT_KEY)
		}
	}

	async function setDefaultProject(id: string | null) {
		setDefaultProjectId(id)
		if (id === null) {
			await chrome.storage.local.remove(DEFAULT_KEY)
		} else {
			await chrome.storage.local.set({ [DEFAULT_KEY]: id })
		}
	}

	return {
		configs,
		loading,
		defaultProjectId,
		addConfig,
		updateConfig,
		removeConfig,
		setDefaultProject,
	}
}
