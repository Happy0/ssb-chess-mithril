const m = require('mithril');
const SettingsDialog = require('../settings/settings-dialog');

module.exports = (mainCtrl, settings, globalObservables) => {
  m.route.prefix = '?';

  const { gamesWhereMyMove, friendsObservableGames, pendingChallengesReceived, unseenNotifications } = globalObservables;

  const gamesInProgress = {
    name: 'Games',
    link: '/my_games',
    count: 0,
    countHoverText: () => `You have ${gamesInProgress.count} games in progress.`,
  };
  const gamesMyMove = {
    name: 'My Move',
    link: '/games_my_move',
    count: 0,
    countUpdateFn: () => gamesWhereMyMove,
    countHoverText: () => `${gamesMyMove.count} games awaiting your move.`,
  };
  const invitations = {
    name: 'Invitations',
    link: '/invitations',
    count: 0,
    countUpdateFn: () => pendingChallengesReceived,
    countHoverText: () => `${invitations.count} pending invitations received.`,
  };
  const observable = {
    name: 'Observe',
    link: '/observable',
    count: 0,
    countUpdateFn: () => friendsObservableGames,
    countOnHoverOnly: true,
    countHoverText: () => `${observable.count} observable games.`,
  };
  const recent = {
    name: 'Recent Activity',
    link: '/activity',
    count: 0,
    countUpdateFn: () => unseenNotifications,
    countHoverText: () => 'Recent Activity',
  };

  const navItems = [gamesInProgress, gamesMyMove, invitations, observable, recent];

  function renderNavItem(navItem) {
    return m('span', {
      class: 'ssb-chess-nav-item',
    }, m(m.route.Link, {
      href: navItem.link,
      title: navItem.countHoverText(),
    },

    [m('span', navItem.name),
      m('span', {
        style: (navItem.countOnHoverOnly || navItem.count === 0) ? 'display: none' : '',
        class: 'ssb-chess-nav-count',
      }, `(${navItem.count})`),
    ]));
  }

  const closeSettingsDialog = () => {
    const dialogElementId = 'ssb-chess-settings-dialog';
    const element = document.getElementById(dialogElementId);

    if (element) {
      element.parentNode.removeChild(element);
    }
  };

  const showSettings = () => {
    const element = document.getElementById('ssb-chess-settings-dialog');

    if (!element) {
      const container = document.createElement('div');
      container.id = 'ssb-chess-settings-dialog';

      const settingsDialog = SettingsDialog(settings, closeSettingsDialog);

      document.body.appendChild(container);
      m.render(container, m(settingsDialog));
    }
  };

  function renderNavigation() {
    return m('div', [
      navItems.map(renderNavItem),
      m('a', { id: 'ssb-chess-settings-nav-item', href: '#', onclick: showSettings }, 'SETTINGS'),
    ]);
  }

  function keepCountsUpdated() {
    const watches = navItems.map((navItem) => {
      if (navItem.countUpdateFn) {
        return navItem.countUpdateFn()((items) => {
          const numItems = items.length;
          navItem.count = numItems;
          m.redraw();
        });
      } else {
        return () => {}
      }
    });

    return watches;
  }

  return {
    view: () => renderNavigation(),
    oncreate: () => {
      this.watches = keepCountsUpdated();
    },
    onremove: () => {
      this.watches.forEach(watch => watch());
    },
  };
};
