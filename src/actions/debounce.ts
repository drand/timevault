export function createDebouncer<T>(timeoutMs = 500) {
    let actionId: ReturnType<typeof setTimeout> | null = null
    return (fn: () => Promise<T>): Promise<T> => {
        if (actionId) {
            clearTimeout(actionId)
        }

        return new Promise(resolve => {
            actionId = setTimeout(() => resolve(fn()), timeoutMs)
        })
    }
}
