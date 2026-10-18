const m = require('mithril');
const MainCtrl = require('ssb-chess');
const util = require('util');

const MiniboardListComponent = require('./ui/miniboard/miniboard_list');
const NavigationBar = require('./ui/pageLayout/navigation');
const GameComponent = require('./ui/game/gameView');
const PlayerProfileComponent = require('./ui/player/player_profile');
const InvitationsComponent = require('./ui/invitations/invitations');
const RecentActivityComponent = require('./ui/recent_activity/recent');
const PgnExportComponent = require('./ui/export/pgnExport');
const Notifier = require('./ui/notify/notifier');

module.exports = (attachToElement, dataAccess, opts = {}) => {
  const { initialView } = opts;

  // function cssFileElements() {
  //   const styles = m('div', {}, cssPaths().map(file => m('link', { rel: 'stylesheet', href:  file })));
  //   return styles
  // }

  function cssPaths() {
    const cssFiles = [
      './css/global.css',
      './css/chessground-examples/assets/chessground.css',
      './css/chessground-examples/assets/theme.css',
      './css/board-theme.css',
      './css/miniboards.css',
      './css/largeBoard.css',
      './css/invites.css',
      './css/loading.css',
      './css/promote.css',
      './css/game.css',
      './css/historyArea.css',
      './css/playerProfiles.css',
      './css/actionButtons.css',
      './css/activity.css',
      './css/pgnExport.css',
      './css/nextPrevious.css'
    ];

    const rootDir = `${__dirname}/`;
    return cssFiles.map(file => rootDir + file)
  }

  function appendCss() {

    cssPaths().forEach((filepath) => {
      const link = document.createElement('link');

      link.setAttribute('rel', 'stylesheet');
      link.setAttribute('href', filepath);
      document.head.appendChild(link);
    })
  }

  async function appRouter(mountElement, mainCtrl, settingsCtrl) {
    appendCss();

    const gamesInProgressObs = mainCtrl.getGameCtrl().getMyGamesInProgress();
    const gamesMyMoveObs = mainCtrl.getGameCtrl().getGamesWhereMyMove();
    const observableGamesObs = mainCtrl.getGameCtrl().getFriendsObservableGames();
    const userRecentActivity = mainCtrl.getRecentActivityCtrl().getRecentActivityForUserGames();

    // Hack: keep observables loaded with the latest value.
    const watches = [
      gamesInProgressObs(e => e),
      gamesMyMoveObs(e => e),
      observableGamesObs(e => e),
      userRecentActivity(e => e)
     ];

    const defaultView = initialView || '/my_games';

    m.route.prefix = '?';

    const navigationBar = NavigationBar(mainCtrl, settingsCtrl)

    m.route(mountElement, defaultView, {
      '/my_games': layoutTemplate(navigationBar, MiniboardListComponent(mainCtrl, gamesInProgressObs, mainCtrl.getMyIdent())),
      '/games_my_move': layoutTemplate(navigationBar, MiniboardListComponent(mainCtrl, gamesMyMoveObs, mainCtrl.getMyIdent())),
      '/games/:gameId': {
        onmatch(args) {
          const gameId = atob(args.gameId);
          const gameSituationObs = mainCtrl.getGameCtrl().getSituationObservable(gameId);

          const observables = {
            situationObservable: gameSituationObs,
            gamesWhereMyMove: gamesMyMoveObs,
            observableGames: observableGamesObs
          }

          return GameComponent(gameId, dataAccess, mainCtrl, observables, settingsCtrl).then((gameComponent) => {
            return layoutTemplate(navigationBar, gameComponent);
          })

        },
      },
      '/invitations': layoutTemplate(navigationBar, InvitationsComponent(mainCtrl)),
      '/activity': layoutTemplate(navigationBar, RecentActivityComponent(mainCtrl, userRecentActivity)),
      '/observable': layoutTemplate(navigationBar, MiniboardListComponent(mainCtrl, observableGamesObs, mainCtrl.getMyIdent())),
      '/player/:playerId': layoutTemplate(navigationBar, PlayerProfileComponent(mainCtrl)),
      '/games/:gameId/pgn': {
        onmatch(args) {
          const gameId = atob(args.gameId);
          return mainCtrl.getPgnCtrl()
            .getPgnExport(gameId)
            .then(pgnText => layoutTemplate(navigationBar, PgnExportComponent(gameId, pgnText)));
        },
      },
    });

    return watches;
  }

  function layoutTemplate(navigationBarComponent, component) {
    
    // TODO: the nav bar should accept observables by injection and we should give it
    // the same instances on each render so there's not jitter on the numbers in the nav items
    return {
      view: function() {
        return m('div', {className: 'ssb-chess-container'}, [
          m(navigationBarComponent),
          m('div', m(component))
      ])
        
        
      }
    }

  }

  const whoAmIAsync = util.promisify(dataAccess.whoAmI.bind(dataAccess))

  const globalWatches = whoAmIAsync().then((ident) => {
    const mainCtrl = MainCtrl(dataAccess, ident.id);
    const settingsCtrl = mainCtrl.getSettingsCtrl();

    // Display HTML5 notifications if the user is not viewing the chess app
    // and one of their games has an update.
    const notifier = Notifier(mainCtrl);
    notifier.startNotifying();

    return appRouter(attachToElement, mainCtrl, settingsCtrl);
  })

  return {
    goToGame: (gameId) => {
      const gameRoute = `/games/${btoa(gameId)}`;
      m.route.set(gameRoute);
    },
    destroy: () => {
      // unmount the app
      m.mount(attachToElement, null);
      globalWatches.then((watches) => watches.forEach(w => w()))
    }
  };
};



