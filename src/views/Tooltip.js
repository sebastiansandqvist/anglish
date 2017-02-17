import m from 'mithril';
// import T from 's-types';

function keepInBounds({ dom }) {
	console.log({dom: dom.querySelector('.Tooltip')});
}

function view({ attrs, children }) {
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