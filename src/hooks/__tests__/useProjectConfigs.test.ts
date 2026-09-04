import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProjectConfigs } from '../useProjectConfigs'

const storageGet = vi.mocked(chrome.storage.local.get)
const storageSet = vi.mocked(chrome.storage.local.set)
const storageRemove = vi.mocked(chrome.storage.local.remove)

describe('useProjectConfigs', () => {
	beforeEach(() => {
		storageGet.mockReset()
		storageSet.mockReset().mockResolvedValue(undefined)
		storageRemove.mockReset().mockResolvedValue(undefined)
	})

	it('loads the default project only when Favorite is enabled', async () => {
		storageGet.mockResolvedValue({
			favoriteEnabled: true,
			defaultProjectId: 'project-1',
		})

		const { result } = renderHook(() => useProjectConfigs())

		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.favoriteEnabled).toBe(true)
		expect(result.current.defaultProjectId).toBe('project-1')
		expect(result.current.selectedProjectId).toBe('project-1')
	})

	it('ignores a stale default project when Favorite is disabled', async () => {
		storageGet.mockResolvedValue({
			favoriteEnabled: false,
			defaultProjectId: 'project-1',
			selectedProjectId: 'project-2',
		})

		const { result } = renderHook(() => useProjectConfigs())

		await waitFor(() => expect(result.current.loading).toBe(false))
		expect(result.current.favoriteEnabled).toBe(false)
		expect(result.current.defaultProjectId).toBeNull()
		expect(result.current.selectedProjectId).toBe('project-2')
	})

	it('clears the default but preserves the selected project when Favorite is disabled', async () => {
		storageGet.mockResolvedValue({
			favoriteEnabled: true,
			defaultProjectId: 'project-1',
			selectedProjectId: 'project-1',
		})

		const { result } = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(() => result.current.setFavoriteEnabled(false))

		expect(result.current.favoriteEnabled).toBe(false)
		expect(result.current.defaultProjectId).toBeNull()
		expect(result.current.selectedProjectId).toBe('project-1')
		expect(storageSet).toHaveBeenCalledWith({
			favoriteEnabled: false,
			defaultProjectId: null,
			selectedProjectId: 'project-1',
		})
		expect(storageRemove).not.toHaveBeenCalledWith('selectedProjectId')
	})

	it('persists the selected project independently', async () => {
		storageGet.mockResolvedValue({ favoriteEnabled: false })

		const { result } = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(() => result.current.setSelectedProject('project-2'))

		expect(result.current.selectedProjectId).toBe('project-2')
		expect(storageSet).toHaveBeenCalledWith({
			selectedProjectId: 'project-2',
		})
	})

	it('keeps the default null when Favorite is enabled without a selected project', async () => {
		storageGet.mockResolvedValue({
			favoriteEnabled: false,
			defaultProjectId: 'stale-project',
		})

		const { result } = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(result.current.loading).toBe(false))

		await act(() => result.current.setFavoriteEnabled(true))

		expect(result.current.favoriteEnabled).toBe(true)
		expect(result.current.selectedProjectId).toBe('')
		expect(result.current.defaultProjectId).toBeNull()
		expect(storageSet).toHaveBeenCalledWith({
			favoriteEnabled: true,
			defaultProjectId: null,
		})
		expect(storageRemove).not.toHaveBeenCalledWith('defaultProjectId')
	})

	it('reopens with a null default when Favorite is enabled without a favorite project', async () => {
		const stored: Record<string, unknown> = {
			favoriteEnabled: false,
			defaultProjectId: 'stale-project',
			selectedProjectId: 'remembered-project',
		}
		storageGet.mockImplementation(async () => ({ ...stored }))
		storageSet.mockImplementation(async (items) => {
			Object.assign(stored, items)
		})

		const firstOpen = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(firstOpen.result.current.loading).toBe(false))
		await act(() => firstOpen.result.current.setFavoriteEnabled(true))
		firstOpen.unmount()

		const reopened = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(reopened.result.current.loading).toBe(false))

		expect(reopened.result.current.favoriteEnabled).toBe(true)
		expect(reopened.result.current.defaultProjectId).toBeNull()
		expect(reopened.result.current.selectedProjectId).toBe('')
	})

	it('restores the selected project after Favorite is disabled and the app reopens', async () => {
		const stored: Record<string, unknown> = {
			favoriteEnabled: true,
			defaultProjectId: 'project-a',
			selectedProjectId: 'project-a',
		}
		storageGet.mockImplementation(async () => ({ ...stored }))
		storageSet.mockImplementation(async (items) => {
			Object.assign(stored, items)
		})
		storageRemove.mockImplementation(async (keys) => {
			for (const key of Array.isArray(keys) ? keys : [keys]) {
				delete stored[key]
			}
		})

		const firstOpen = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(firstOpen.result.current.loading).toBe(false))

		await act(() => firstOpen.result.current.setFavoriteEnabled(false))
		firstOpen.unmount()

		const reopened = renderHook(() => useProjectConfigs())
		await waitFor(() => expect(reopened.result.current.loading).toBe(false))

		expect(reopened.result.current.favoriteEnabled).toBe(false)
		expect(reopened.result.current.defaultProjectId).toBeNull()
		expect(reopened.result.current.selectedProjectId).toBe('project-a')
	})
})
