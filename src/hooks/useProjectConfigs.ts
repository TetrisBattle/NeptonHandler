import { useEffect, useState } from 'react'
import {
	type NeptonHandlerConfig,
	type ProjectConfig,
	parseNeptonHandlerConfig,
} from '../utils/neptonHandlerConfig'

const STORAGE_KEY = 'projectConfigs'
const DEFAULT_KEY = 'defaultProjectId'
const FAVORITE_ENABLED_KEY = 'favoriteEnabled'
const SELECTED_PROJECT_KEY = 'selectedProjectId'

export function useProjectConfigs() {
	const [configs, setConfigs] = useState<ProjectConfig[]>([])
	const [loading, setLoading] = useState(true)
	const [defaultProjectId, setDefaultProjectId] = useState<string | null>(null)
	const [favoriteEnabled, setFavoriteEnabledState] = useState(false)
	const [selectedProjectId, setSelectedProjectId] = useState('')

	useEffect(() => {
		chrome.storage.local
			.get([
				STORAGE_KEY,
				DEFAULT_KEY,
				FAVORITE_ENABLED_KEY,
				SELECTED_PROJECT_KEY,
			])
			.then((result) => {
				const stored = result[STORAGE_KEY]
				if (Array.isArray(stored)) {
					setConfigs(stored as ProjectConfig[])
				}
				const storedFavoriteEnabled = result[FAVORITE_ENABLED_KEY] === true
				setFavoriteEnabledState(storedFavoriteEnabled)
				const storedDefault = result[DEFAULT_KEY]
				const storedSelectedProject = result[SELECTED_PROJECT_KEY]
				if (storedFavoriteEnabled) {
					if (typeof storedDefault === 'string') {
						setDefaultProjectId(storedDefault)
						setSelectedProjectId(storedDefault)
					}
				} else if (typeof storedSelectedProject === 'string') {
					setSelectedProjectId(storedSelectedProject)
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
		if (selectedProjectId === id) {
			setSelectedProjectId('')
			await chrome.storage.local.remove(SELECTED_PROJECT_KEY)
		}
	}

	async function setDefaultProject(id: string | null) {
		setDefaultProjectId(id)
		if (id === null) {
			await chrome.storage.local.remove(DEFAULT_KEY)
		} else {
			setSelectedProjectId(id)
			await chrome.storage.local.set({
				[DEFAULT_KEY]: id,
				[SELECTED_PROJECT_KEY]: id,
			})
		}
	}

	async function setFavoriteEnabled(enabled: boolean) {
		setFavoriteEnabledState(enabled)
		setDefaultProjectId(null)
		await chrome.storage.local.set({
			[FAVORITE_ENABLED_KEY]: enabled,
			[DEFAULT_KEY]: null,
			...(selectedProjectId
				? { [SELECTED_PROJECT_KEY]: selectedProjectId }
				: {}),
		})
	}

	async function setSelectedProject(id: string) {
		setSelectedProjectId(id)
		if (id) {
			await chrome.storage.local.set({ [SELECTED_PROJECT_KEY]: id })
		} else {
			await chrome.storage.local.remove(SELECTED_PROJECT_KEY)
		}
	}

	function exportConfig(): NeptonHandlerConfig {
		return {
			projectConfigs: configs,
			defaultProjectId,
			favoriteEnabled,
			selectedProjectId,
		}
	}

	async function importConfig(value: unknown) {
		const imported = parseNeptonHandlerConfig(value)
		await chrome.storage.local.set({
			[STORAGE_KEY]: imported.projectConfigs,
			[DEFAULT_KEY]: imported.defaultProjectId,
			[FAVORITE_ENABLED_KEY]: imported.favoriteEnabled,
			[SELECTED_PROJECT_KEY]: imported.selectedProjectId,
		})
		setConfigs(imported.projectConfigs)
		setDefaultProjectId(imported.defaultProjectId)
		setFavoriteEnabledState(imported.favoriteEnabled)
		setSelectedProjectId(imported.selectedProjectId)
	}

	const sortedConfigs = [...configs].sort((a, b) =>
		a.name.localeCompare(b.name),
	)

	return {
		configs: sortedConfigs,
		loading,
		defaultProjectId,
		favoriteEnabled,
		selectedProjectId,
		addConfig,
		updateConfig,
		removeConfig,
		setDefaultProject,
		setFavoriteEnabled,
		setSelectedProject,
		exportConfig,
		importConfig,
	}
}
