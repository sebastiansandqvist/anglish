import m from 'mithril';
import stream from 'mithril/stream';
import dictionary from '../dictionary.js';
import Word from './Word.js';

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
					m('button.Button', { onclick: model.parse }, 'Parse for Anglish origin')
				),
				m('hr'),
				m('.Output', model.parsedText.map((data) => m(Word, data)))
			)
		);
	}
};

export default App;