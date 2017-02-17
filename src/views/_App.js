import m from 'mithril';
import stream from 'mithril/stream';
import dictionary from '../dictionary.js';
import Tooltip from './Tooltip.js';

function getWordClass(word) {
	if (dictionary[word] === undefined) { return ''; }
	if (dictionary[word].length === 1 && dictionary[word][0] === '-') {
		return 'noReplacements';
	}
	return 'replaced';
}

function getReplacements(word) {
	return dictionary[word] || [];
}

const model = {
	inputText: stream('The aardvark entered the abbess'),
	parsedText: [],
	parse() {
		model.parsedText = model.inputText().split(' ').map(function(word) {
			return {
				word,
				wordClass: getWordClass(word.toLowerCase()),
				replacements: getReplacements(word.toLowerCase())
			};
		});
	}
};

function tooltipValue(replacements) {

	if (replacements.length === 1 && replacements[0] === '-') {
		return 'No replacements found';
	}

	return `Use: ${replacements.join(', ')}`;

}

const Word = {
	view({ attrs }) {
		if (attrs.replacements.length === 0) {
			return m('span.Word', attrs.word);
		}
		return (
			m(Tooltip, { value: tooltipValue(attrs.replacements) },
				m('span.Word', { className: attrs.wordClass }, attrs.word)
			)
		);
	}
};

const App = {
	view() {
		return (
			m('.pad20',
				m('textarea.Input', {
					className: 'small',
					value: model.inputText(),
					oninput: m.withAttr('value', model.inputText)
				}),
				m('.center.pad20',
					m('button.Button', { onclick: model.parse }, 'Abcdefg')
				),
				m('hr'),
				m('.Output', model.parsedText.map((data) => m(Word, data)))
			)
		);
	}
};

export default App;