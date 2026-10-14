
const m = require('mithril')
const EmbeddedChat = require('ssb-embedded-chat');
const pull = require('pull-stream')

module.exports = function ChatBox(myIdent, dataAccess, situationObservable) {
    return {
        view: () => {
            return m('div', {className: 'ssb-chess-chat'});
        },
        oncreate: function (vNode) {
            const originalSituation = situationObservable();
            this.embeddedChat = makeEmbeddedChat(myIdent, dataAccess, originalSituation);
            vNode.dom.appendChild(this.embeddedChat.getChatboxElement());
        },
        onremove: function() {
            this.embeddedChat.destroy();
        }
    }
} 

function makeEmbeddedChat(myIdent, dataAccess, situation) {
      const config = {
        rootMessageId: situation.gameId,
        chatMessageType: 'chess_chat',
        chatMessageField: 'msg',
        chatboxEnabled: true,
        previousChatId: situation.rematchFrom
      };

      if (situation.players[myIdent] != null) {
        config.isPublic = false;
        config.participants = Object.keys(situation.players);
      } else {
        config.isPublic = true;
      }

      config.publishPublic = dataAccess.publishPublicChessMessage.bind(dataAccess);
      config.publishPrivate = dataAccess.publishPrivateChessMessage.bind(dataAccess);

      config.getChatStream = (gameId, live) => 
        pull(dataAccess.allGameMessages(gameId, live), pull.filter(msg => !msg.sync && msg.value && msg.value.content.type == "chess_chat"));

      config.aboutSelfChangeStream = (since) => dataAccess.aboutSelfChangesUserIds(since);

      config.getDisplayName = (id, cb) => dataAccess.getPlayerDisplayName(id, cb);

      const chat = EmbeddedChat(config);

      return chat;
}