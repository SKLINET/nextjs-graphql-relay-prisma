export const mapObj = (obj = {}, cb) => Object.keys(obj).map(i => cb(obj[i], i));
