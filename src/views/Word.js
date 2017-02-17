import m from 'mithril';
import T from 's-types';
import Tooltip from './Tooltip.js';

const WordType = T({
	word: T.string,
	wordClass: T.string,
	replacements: T.arrayOf(T.string)
});

function tooltipValue(replacements) {

	if (replacements.length === 1 && replacements[0] === '-') {
		return 'No replacements found';
	}

	return `Use: ${replacements.join(', ')}`;

}

function view({ attrs }) {

	if (window.__DEV__) {
		WordType(attrs);
	}

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