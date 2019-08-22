const m = require('mithril');

module.exports = (chessBoardDomElement, colour, column, onChoice) => {
  const roles = ['queen', 'rook', 'knight', 'bishop'];

  function renderPiece(role, cb) {
    return m('piece', {
      class: `${colour} ${role}`,
      onclick: () => cb(role),
    });
  }

  const PromotionBox = (cb) => {
    const component = {
      view: () => m('div', {
        id: 'ssb-promotion-box',
      }, [
        m('div', {
          id: 'ssb-promotion-box-pieces',
        }, roles.map(role => renderPiece(role, cb))),
      ]),
    };

    return component;
  };


  function columnLetterToNumberFromZero(columnLetter) {
    return columnLetter.codePointAt(0) - 97;
  }

  function renderPromotionOptionsOverlay() {
    const c = document.getElementsByClassName('ssb-chess-container')[0];

    const prom = document.createElement('div');

    const cb = (piece) => {
      c.removeChild(prom);
      onChoice(piece);
    };

    const box = PromotionBox(cb);

    const left = document.getElementsByTagName("cg-board")[0].getBoundingClientRect().x + (2 * 75);
    const top = document.getElementsByTagName("cg-board")[0].getBoundingClientRect().y + (3 * 75) + 35;

    const promotionBox = m('div', {
      style: `z-index: 1000; position: absolute; left: ${left}px; top: ${top}px;`,
    }, m(box));

    c.appendChild(prom);

    m.render(prom, promotionBox);
  }

  return {
    renderPromotionOptionsOverlay,
  };
};
