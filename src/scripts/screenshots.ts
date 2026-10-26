/**
 * User Guide screenshots are the original captures. Wide ones shrink to the
 * column until the labels are hard to read, and a full-width bar only a few
 * dozen pixels tall disappears. Short captures stay at their own pixel size
 * inside a sideways scroller. Any screenshot opens at full size on click.
 */

// Only a full-width bar (a pager, a tab strip) stays at its own pixel height.
// Taller shots fit the column so the whole screen stays in view, and open
// full size on click when the labels need to be read.
const SHORT_SHOT = 160

function columnWidth(img: HTMLImageElement): number {
	const parent = img.parentElement
	if (!parent) return img.clientWidth
	return parent.clientWidth
}

function prepare(img: HTMLImageElement) {
	if (img.dataset.shot === 'ready' || img.closest('.shot-zoom')) return
	if (!img.naturalWidth || !img.naturalHeight) return

	const available = columnWidth(img)
	if (!available) return

	img.dataset.shot = 'ready'
	img.tabIndex = 0
	img.setAttribute('role', 'button')
	const label = img.alt ? `View full size: ${img.alt}` : 'View full size'
	img.setAttribute('aria-label', label)

	const scale = available / img.naturalWidth
	const shortCapture = img.naturalHeight <= SHORT_SHOT && scale < 0.75
	if (shortCapture && img.parentElement && !img.parentElement.classList.contains('shot-scroll')) {
		const frame = document.createElement('div')
		frame.className = 'shot-scroll'
		img.parentElement.insertBefore(frame, img)
		frame.append(img)
		img.style.width = `${img.naturalWidth}px`
		img.style.maxWidth = 'none'
	}

	img.addEventListener('click', () => openShot(img))
	img.addEventListener('keydown', (event) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			openShot(img)
		}
	})
}

function dialog(): HTMLDialogElement {
	const existing = document.querySelector<HTMLDialogElement>('dialog.shot-zoom')
	if (existing) return existing

	const element = document.createElement('dialog')
	element.className = 'shot-zoom'
	element.innerHTML =
		'<button type="button" class="shot-zoom-close">Close</button><img alt="" />'
	element.addEventListener('click', (event) => {
		if (event.target === element) element.close()
	})
	element.querySelector('button')?.addEventListener('click', () => element.close())
	document.body.append(element)
	return element
}

function openShot(source: HTMLImageElement) {
	const element = dialog()
	const full = element.querySelector('img')
	if (!full) return
	full.src = source.currentSrc || source.src
	full.alt = source.alt
	element.showModal()
}

export function setupScreenshots() {
	document.querySelectorAll<HTMLImageElement>('.sl-markdown-content img').forEach((img) => {
		if (img.complete) prepare(img)
		else img.addEventListener('load', () => prepare(img), { once: true })
	})
}

setupScreenshots()
document.addEventListener('astro:page-load', setupScreenshots)
