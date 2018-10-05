![A screenshot of ssb-chess](http://i.imgur.com/Xz9ovwX.png)

Correspondence chess built on top of the scuttlebutt platform. More information about scuttlebutt here: https://staltz.com/an-off-grid-social-network.html and [https://www.scuttlebutt.nz/](https://www.scuttlebutt.nz/)

It is built to allow it to be integrated into scuttlebutt viewers (such as [patchbay](https://www.github.com/ssbc/patchbay), [patchwork](https://www.github.com/ssbc/patchbay) using [depject](https://github.com/depject/depject) so that they can take care of things like discovering friends to play with, etc.

### Installation
ssb-chess-mithril is currently integrated into [patchbay](https://www.github.com/ssbc/patchbay). You can find it in the menu at the top right (the blue dot) and then the 'chess' menu item.

### Libraries used
* [ssb-chess](https://www.github.com/happy0/ssb-chess) is used for all the ssb-chess protocol logic (querying games, making moves, sending invites, etc)
* [Mithriljs](https://mithril.js.org/) is used for rendering the pages.
* [Chessground](https://github.com/ornicar/chessground) is used for the board and pieces widget and animating the moves.
* [Embedded Chat](https://github.com/happy0/ssb-embedded-chat) is used for the chatroom to allow the players to chat during their game.

## Integrating ssb-chess into a scuttlebutt application using depject

Requires the [ssb-chess-db](https://www.github.com/happy0/ssb-chess-db) scuttlebot plugin to be installed.

You can read more about depject [here](https://github.com/depject/depject)

<TODO> The strategy for this was recently updated. I need to document the
new approach :)
