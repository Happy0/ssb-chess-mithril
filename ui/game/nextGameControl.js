const computed = require('mutant/computed');
const m = require('mithril');
const watch = require('mutant/watch');

module.exports = (currentGameObservable, gameCollectionObservable) => {

    const watchesToClear = [];

    const buttonGames = computed([getPreviousGame(), getNextGame(), currentGameObservable], (next, previous, current) => {
        return {
            nextGame: next,
            previousGame: previous,
            currentGame: current
        }
    });

    function getGameInDirection(isForward) {
        return computed([currentGameObservable, gameCollectionObservable], (currentGame, gamesMyMove) => {

            if (gamesMyMove.size === 0) {
                return null;
            }
            else {
                const sorted = sortGamesByTimestamp(gamesMyMove, isForward);
                const idxCurrentGame = sorted.findIndex(game => game.gameId === currentGame.gameId);

                const nextGame = sorted[idxCurrentGame + 1];

                if (idxCurrentGame === null || idxCurrentGame === undefined) {
                    return sorted[0];
                }
                if (nextGame) {
                    return nextGame;
                } else {
                    // Circle round to the first game
                    return sorted[0];
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
        
        // .concat to copy the array so that we don't change the observable's value.
        return games.concat().sort(comparer);
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
            classes = classes + ' ssb-chess-next-previous-button-hidden'
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
            var hasPrevious = previous != null && previous.gameId !== games.currentGame.gameId;

            var next = games.nextGame;
            var hasNext = next != null && next.gameId !== games.currentGame.gameId;

            return [
                renderButton("<-", hasPrevious ? previous.gameId : null, !hasPrevious),
                renderButton("->", hasNext ? next.gameId : null, !hasNext)
            ]
        }
    }

    return {
        oncreate: () => {
            w = watch(buttonGames, m.redraw);
            watchesToClear.push(w);
        },
        view: () => {
            return m('div', { className: 'ssb-chess-next-previous-buttons-container' },
                renderButtons()
            );
        },
        onremove: () => {
            watchesToClear.forEach(w => w());
        }
    }
}