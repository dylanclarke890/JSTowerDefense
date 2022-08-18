var TD = TD || {};
TD.utils = TD.utils || {};

TD.utils.isColliding = function (first, second) {
  if (!first || !second) return false;
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

/**
 * Remove items from an array and return the next index.
 * Useful for during loops as the new index can be used to ensure
 * items are not accidentally skipped.
 * @param {Array} arr array to splice.
 * @param {number} start index to start from.
 * @param {number} deleteCount how many to remove.
 * @returns {number} The index of the next item in the list, or zero if no items are left.
 */
TD.utils.splice = function (arr, start, deleteCount) {
  arr.splice(start, deleteCount);
  if (start - deleteCount <= 0) return 0;
  return start - deleteCount;
};

TD.utils.new2dCanvas = function (id, width, height) {
  const canvas = document.getElementById(id);
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  return [canvas, ctx];
};