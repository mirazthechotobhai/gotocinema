# GoToCinema

Complete static GoToCinema website export.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## GitHub Pages

Upload the contents of this folder to the repository root, then enable GitHub Pages from the repository's **Settings → Pages** menu using the branch root folder.

## Ad and direct-link settings

Edit only `ads-config.js`. Each setting has a name, a `status` value, and a `duration` value. Use `"on"` to enable it or `"off"` to disable it. Use `duration: "unlimited"` for an ad that always runs, or `duration: "#"` to follow the timer. No `index.html` edit is needed.

The default timer shows timed ads for 10 minutes after a visitor's first visit, then hides the timer and pauses timed ads until the next cycle. Change `adsTimer.repeatEveryHours` to `1`, `2`, `10`, or any positive number of hours to choose when the next 10-minute window begins. The timer is stored per browser, so refreshing the page does not restart it.

- Direct link: opens in a new tab when a movie, TV, or anime poster is clicked.
- Popunder: loads globally for normal page interaction.
- Social Bar: loads globally.
- Banner 728x90: appears responsively below the player on details pages.
- Native Banner: appears below the cast profiles on details pages.

## Website name and logo

Edit only `website-config.js` to change the visible website name, browser title, logo text, or logo image URL:

```js
siteName: 'GoToCinema',
pageTitle: 'Go To Cinema - Watch Movies, TV Shows & Anime',
logoText: 'GOTO CINEMA',
logoImagePosition: 2,
logoImageUrl: 'logo-icon.png'
```

`logoImagePosition` counts letters from left to right, ignoring spaces. With `2`, the logo replaces the second letter (`O`) in `GOTO`. Change it to `3` to replace the third letter. Set `logoImageUrl: '#'` to hide the logo and show the original letter again.

The first words of `logoText` use the bold style and the last word uses the thin style. This also works with three-word names: the first two words stay bold and the last word stays thin. You can replace `logoImageUrl` with a local image path or a public image URL.

## Website primary color

Edit only `website-colors.js`:

```js
primaryColor: '#16a34a'
```

This changes the main red accent color to the selected color. The current export uses green (`#16a34a`) as the working example.

The admin-panel color customization has been removed. Website colors are no longer read from or saved to Firebase; `website-colors.js` is the only primary-color source.

## API settings

Edit only `api-config.js` to change the public API settings used by the site:

- Firebase authentication and Firestore project settings
- TMDB API key, API URL, and image URL
- AniList GraphQL URL and editable featured anime ID
- ImgBB upload settings used for normal member profile photos

This file is loaded before the main application code. It is included in this
ZIP and must stay beside `index.html` when uploading the site to GitHub Pages.
Do not place private server-only credentials in this browser-visible file.

To change the featured anime loaded directly from AniList, edit only the
`animeId` value inside `api-config.js`:

```js
anilist: {
  apiUrl: 'https://graphql.anilist.co',
  animeId: 47880
}
```

The configured anime is shown first in the Anime tab. The remaining Anime tab
items continue to load from AniList's trending and popular lists.

## Admin settings

Edit only `admin-config.js` to change administrator access and the admin
profile:

```js
adminEmails: [
  'first-admin@gmail.com',
  'second-admin@gmail.com'
],
profile: {
  name: 'GoToCinema Admin',
  imageUrl: 'logo-icon.png',
  about: 'GoToCinema administrator'
}
```

The email list supports multiple Gmail addresses. The admin name, image, and
about text are read from this file and are not loaded from or saved to
Firebase. Keep `admin-config.js` beside `index.html`.
