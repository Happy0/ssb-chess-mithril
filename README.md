![A screenshot of ssb-chess](http://i.imgur.com/Xz9ovwX.png)

Correspondence chess built on top of the scuttlebutt platform. More information about scuttlebutt here: https://staltz.com/an-off-grid-social-network.html and [https://www.scuttlebutt.nz/](https://www.scuttlebutt.nz/)

It is built to allow it to be integrated into scuttlebutt viewers (such as [patchbay](https://www.github.com/ssbc/patchbay), [patchwork](https://www.github.com/ssbc/patchbay) using [depject](https://github.com/depject/depject) so that they can take care of things like discovering friends to play with, etc.

### Installation

You can find a desktop app releases to run ssb-chess at [https://www.github.com/happy0/ssb-chess-electron](https://www.github.com/happy0/ssb-chess-electron).

### Libraries used
* [ssb-chess](https://www.github.com/happy0/ssb-chess) is used for all the ssb-chess protocol logic (querying games, making moves, sending invites, etc)
* [Mithriljs](https://mithril.js.org/) is used for rendering the pages.
* [Chessground](https://github.com/ornicar/chessground) is used for the board and pieces widget and animating the moves.
* [Embedded Chat](https://github.com/happy0/ssb-embedded-chat) is used for the chatroom to allow the players to chat during their game.

## Required ssb-server plugins

SEe [https://github.com/Happy0/ssb-chess/blob/master/README.md#required-ssb-server-plugins](https://github.com/Happy0/ssb-chess/blob/master/README.md#required-ssb-server-plugins) for information about ssb-server plugins required to run this.
