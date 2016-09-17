const mony = window.mony = {};

const $html = $('html').css('visibility', 'hidden');

$(() => {
  $html.css('visibility', '');
});

mony.fromTemplate = name => {
  const $el = $(`script[type="template/mony"][name="${name}"]`);

  if (!$el.length) {
    throw new Error(`No template with name '${name}'`);
  }

  return $($el.html());
};

mony.routes = [];

mony.routes.notFound = {
  enter: req => console.error('Route not found:', req),
};

mony.route = (route, opt) => {
  mony.routes.push(Object.assign({}, opt, {
    route,
  }));
};

mony.routeNotFound = opt => {
  mony.routes.notFound = opt;
};

mony.matchRoute = (route, path) => {
  const routeNodes = route.split('/');
  const pathNodes = path.split('/');

  if (routeNodes.length !== pathNodes.length) {
    return null;
  }

  const params = {};

  const matches = routeNodes.every((routeNode, i) => {
    const pathNode = pathNodes[i];

    if (pathNode === undefined) {
      return false;
    }

    if (routeNode.startsWith(':')) {
      params[routeNode.slice(1)] = pathNode;
      return true;
    }

    return (routeNode === pathNode);
  });

  if (!matches) {
    return null;
  }

  return params;
};

$(() => {
  const $wnd = $(window);

  const last = {};

  $wnd.on('hashchange', ev => {
    if (last.route && last.route.leave) {
      last.route.leave(last.req);
    }

    const path = location.hash.slice(1);

    last.req = {
      path,
    };

    const matched = mony.routes.some(reg => {
      const params = mony.matchRoute(reg.route, path);

      if (!params) {
        return false;
      }

      last.req.params = params;
      last.route = reg;

      if (last.route.enter) {
        last.route.enter(last.req);
      }

      return true;
    });

    if (!matched) {
      last.route = mony.routes.notFound;
      last.route.enter(last.req);
    }
  });

  $wnd.trigger('hashchange');
});
