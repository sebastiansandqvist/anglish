import m from 'mithril';
import T from 's-types';

const TooltipType = T({
	value: T.string
});

function keepInBounds({ dom }) {
	const tooltipEl = dom.querySelector('.Tooltip');
	const rect = tooltipEl.getBoundingClientRect();
	const halfWidth = Math.round(rect.width / 2);
	const rightOffset = Math.round(window.innerWidth - rect.right);
	if (rect.left < 20) {
		tooltipEl.style.left = `${halfWidth}px`;
	}
	else if (rect.right > window.innerWidth) {
		tooltipEl.style.left = `${rightOffset}px`;
	}
}

function view({ attrs, children }) {

	if (window.__DEV__) {
		TooltipType(attrs);
	}

	return (
		m('.Tooltip-wrap', { oncreate: keepInBounds },
			children,
			m('.Tooltip', attrs.value)
		)
	);
}

const Tooltip = {
	view
};

export default Tooltip;