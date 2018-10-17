const computed = require('mutant/computed');
const m = require('mithril');
const watch = require('mutant/watch');

module.exports = (currentGameObservable, gamesAwaitingMoveObservable) => {

    const watchesToClear = [];

    const buttonGames = computed([getPreviousGame(), getNextGame()], (next, previous) => {
        return {
            nextGame: next,
            previousGame: previous
        }
    });

    function getGameInDirection(isForward) {
        return computed([currentGameObservable, gamesAwaitingMoveObservable], (currentGame, gamesMyMove) => {

            if (gamesMyMove.size <= 1) {
                return null;
            } else {
                const sorted = sortGamesByTimestamp(gamesMyMove, isForward);
                const idxCurrentGame = sorted.findIndex(game => game.gameId === currentGame.gameId);

                const nextGame = gamesMyMove[idxCurrentGame + 1];

                if (nextGame) {
                    return nextGame;
                } else {
                    // Circle round to the first game
                    return gamesMyMove[0];
                }
            }

        });
    }

    function getNextGame() {
        return getGameInDirection(true);
    }

    function getPreviousGame() {
        return getGameInDirection(false);
    }

    function sortGamesByTimestamp(games, inAscendingOrder) {
        const comparer = (g1, g2) => inAscendingOrder ? (g1.lastUpdateTime - g2.lastUpdateTime) : (g2.lastUpdateTime - g1.lastUpdateTime);
        return games.sort(comparer);
    }

    function goToGame(gameId) {
        const url = '/games/:gameId';

        m.route.set(url, {
          gameId: btoa(gameId),
        });
    }

    function renderButton(text, gameId, isHidden) {
        let classes = 'ssb-chess-next-previous-button';

        if (isHidden) {
            classes += classes + ' ssb-chess-next-previous-button-hidden'
        }

        return m('button', {
            class: classes,
            onclick: () => goToGame(gameId)
        }, text)
    }

    function renderButtons() {
        var games = buttonGames();

        if (!games) {
            return [];
        } else {
            var previous = games.previousGame;
            var hasPrevious = previous != null;

            var next = games.previousGame;
            var hasNext = next != null;

            return [
                renderButton("Previous", hasPrevious ? previous.gameId : null, hasPrevious),
                renderButton("Next", hasNext ? next.gameId : null, hasNext)
            ]
        }
    }

    return {
        oncreate: () => {
            w = watch(buttonGames, m.redraw);
            watchesToClear.push(w);
        },
        view: () => {
            return m('div', {className: 'ssb-chess-next-previous-buttons-container'},
                renderButtons()
            );
        },
        onremove: () => {
            watchesToClear.forEach( w => w() );
        }
    }
}