const pull = require('pull-stream');
const onceTrue = require('mutant/once-true');
const notify = require('./notify')();
const userLocationUtils = require('../viewer_perspective/user_location')();

module.exports = (mainCtrl) => {
  const me = mainCtrl.getMyIdent();

  const userGamesWatcher = mainCtrl.getUserGameWatcherCtrl();

  function getOpponentName(situation, msg) {
    return situation.players[msg.value.author] ? situation.players[msg.value.author].name : '';
  }

  function mapNotification(gameMsg, cb) {
    if (!userLocationUtils.chessAppIsVisible()) {
      const gameId = gameMsg.value.content.type === 'chess_invite' ? gameMsg.key : gameMsg.value.content.root;

      if (!gameId) {
        return;
      }

      const situation = mainCtrl.getGameCtrl().getSituationObservable(gameId);

      onceTrue(situation, (gameSituation) => {
        const opponentName = getOpponentName(gameSituation, gameMsg);
        let notificationDetails = null;

        if (gameMsg.value.content && gameMsg.value.content.type === 'chess_invite' && gameMsg.value.author != me) {
          notificationDetails = {
            type: 'inite',
            from: gameMsg.value.author,
            message: `${opponentName} has invited you to a game`,
            gameId: gameId
          }
        } else if (gameMsg.value.content.type === 'chess_move' && gameMsg.value.author != me) {
          notificationDetails = {
            type: 'your_move',
            from: gameMsg.value.author,
            message: `It's your move in your game against ${opponentName}`,
            gameId: gameId
          }
        } else if (gameMsg.value.content.type === 'chess_game_end' && gameMsg.value.author != me) {
          notificationDetails = {
            type: 'game_end',
            from: gameMsg.value.author,
            message: `Your game with ${opponentName} ended`,
            gameId: gameId
          }
        } else if (gameMsg.value.content.type === 'chess_invite_accept' && gameMsg.value.author != me) {
          notificationDetails = {
            type: 'invite_accepted',
            from: gameMsg.value.author,
            message: `${opponentName} has accepted your game invite`,
            gameId: gameId
          }
        }

        cb(null, notificationDetails);
      });
    }
  }

  function getNotificationStream() {
    const opts = {
      live: true,
      since: Date.now(),
    };

    const gameUpdateStream = userGamesWatcher.chessMessagesForPlayerGames(
      mainCtrl.getMyIdent(),
      opts,
    );

    return pull(gameUpdateStream, pull.asyncMap(mapNotification), pull.filter(x => x != null));
  }

  return {
    getNotificationStream: getNotificationStream,
    notify: (notificationDetails) => {
      notify.showNotification(notificationDetails.message);
    }
  };
};
