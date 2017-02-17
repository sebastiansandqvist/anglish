import m from 'mithril';
import Tooltip from './Tooltip.js';

function tooltipValue(replacements) {

	if (replacements.length === 1 && replacements[0] === '-') {
		return 'No replacements found';
	}

	return `Use: ${replacements.join(', ')}`;

}

function view({ attrs }) {
	if (attrs.replacements.length === 0) {
		return m('span.Word', attrs.word);
	}
	return (
		m(Tooltip, { value: tooltipValue(attrs.replacements) },
			m('span.Word', { className: attrs.wordClass }, attrs.word)
		)
	);
}

const Word = {
	view
};

export default Word;