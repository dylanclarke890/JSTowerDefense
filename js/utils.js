var TD = TD || {};
TD.utils = TD.utils || {};

TD.utils.isColliding = function (first, second) {
  if (
    !(
      first.x > second.x + second.width ||
      first.x + first.width < second.x ||
      first.y > second.y + second.height ||
      first.y + first.height < second.y
    )
  ) {
    return true;
  }
  return false;
};

TD.utils.random = {
  upTo: function (num, floor = false) {
    const res = Math.random() * num;
    return floor ? Math.floor(res) : res;
  },
};
