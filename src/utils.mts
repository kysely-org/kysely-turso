export function freeze<T>(thing: T): Readonly<T> {
	return Object.freeze(thing)
}
