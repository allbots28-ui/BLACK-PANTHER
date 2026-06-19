import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const _s = require('../../guru/config/settings.js');

export const botname      = _s.BOT_NAME      || 'BLACK PANTHER MD';
export const prefix       = _s.BOT_PREFIX    || '.';
export const ownerNumber  = _s.OWNER_NUMBER  || '';
export const ownerName    = _s.OWNER_NAME    || 'GuruTech';
export const session      = _s.SESSION_ID    || 'GURU~H4sIAAAAAAAAA5VVXZOiOBT9L3nVGkFQ0KquWkBQpP0ARJGteYgQMMqXSVBwyv8+hd09PQ+7s708hYTce+4951x+gLzAFFmoAeMfoCT4Chlql6wpERgDtYpjREAXRJBBMAahxTQFH90g9fQRmvF20Rcr1+mR7FQv6XoidNQSlfFNnZkv4NEFZXVIcfiHgMb0WJxCf6AYQVjydBiL/mJaXve3S5Ajs74vobnZWH0ZJeELeLQRISY4T/TyiDJEYGqhZg0x+Rp8bX7KXgfbnWIPJNJJ1VqssMspjhqcdH5Uz7XOwIkyZ6vq4tfgT3Dj7agQ37bEGc2CoeiNmo2IpcTfHYYi1o/xdDM/uHSmim/wKU5yFJkRyhlmzZf73teOkZjcVxt5ru4LgefumVxyq4O+cgPfWNwtzmQCr3hh6n0NuNOD9TpxxI09D8X7gLshuwyyo9OHPIP95TALhpQb5eo8Of8OfE0+tHL+P33HK20p7txDpexqUZb8IvC3AVqq5s7dscmV4xri706TKTWSr8HPL3u8Gl6WTkZTpzcS5p0Jz514/LqWVNkr+ePE0bcT37xMi0/4kFXkTygDP9cC5bzdDcT0WHqLyBa9yfTkaWS6Q2FU5/yiWd5rId7zN0oOsbWZSkZTXFarvdBEwc2VNnqTbSnECK/to70sRRUnL8+KzqgxIzDmH11AUIIpI5DhIm/3+oLQBTC6uigkiD3bC27WenGv64Jn3NnbVSLmDcFKPD5CYQBfrR7O/c4AyYzevRfQBSUpQkQpimaYsoI0C0QpTBAF47+/d0GOavZGXJtOELsgxoQyL6/KtIDRB6sfhzAMiypnbpOHWrtABIy5z23EGM4T2vaxyiEJj/iKtCNkFIxjmFL0q0JEUATGjFTol2u1ImobLxmDkbydC6ALsichOGo1PhClvjCQxNFwOOblv+i3WxsWluW3HDHQBTlsvwaa47kz3dlKHOiC9HmV5ziuP+RFSeqPhoPn7fbg8Qt1myRCDOKUPsfAXb4MCk03ocmN9OlUCRNFSxTwWeWHXN7pODU7XtPLyVW+O+fJJLJEqXmVDXq1I89YGHaJ1nV2yox+8vIPQVoHzJykPke3NaNr47gX7e3NqODJnMudIk98SYoUpJaeWGw2r+r2fFHEirf15lasgjnJLdUZ6gwFFY+5flrE64lm9P2J/dJmi9AVh+j3ZPqG3HULKjLhRv7UgOtVbtcEy9v1rsfP7aTuUCcJFkl6D3up3dOFZC+s5YEEb/NhGS86zLpui5txdh3s+C5Z5lfiYeVNyE8jpe8DDD8l1vLXvsYYPefBO0//yecb8FZ23KP7W4z3CfMvLlVDU06ZfbRsqbfgAuUmuNVKxj318MrNtupG9Sz/JAfF4BgV4PH43gVlCllckAyMAc0OEHQBKapWxGYeF3/6WygLU0kSsy07hZQpn8bY4AxRBrMSjHlJ5mWxPxoKXZA1Slm6DLIPPwGlfVZzBTx+ApcN/sJrBwAA';
export const mycode       = ownerNumber.replace(/\D/g, '').slice(0, 3) || '254';
export const herokuAppName = process.env.HEROKU_APP_NAME || '';
export function getHerokuApiKey() { return process.env.HEROKU_API_KEY || ''; }

export default _s;
