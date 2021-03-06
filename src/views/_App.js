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

function isolateWord(word) {
  return word.toLowerCase().replace(/[^0-9a-z]/g, '');
}

const model = {
  inputText: stream(''),
  parsedText: [],
  parse() {
    model.parsedText = model.inputText().split('\n').map((line) => line.split(' ').map((word) => ({
      word,
      wordClass: getWordClass(isolateWord(word)),
      replacements: getReplacements(isolateWord(word))
    })));
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
          m('button.Button', { onclick: model.parse }, 'Parse Text')
        ),
        m('hr'),
        m('.Output', model.parsedText.map((line) =>
          m('p', line.map((data) => m(Word, data)))
        ))
      )
    );
  }
};

export default App;
