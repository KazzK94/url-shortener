
# URL Shortener
This is a url shortener. You can create shorter urls using this api, and when you visit the short url you'll be redirected to the long url automatically.

## Shorten URL (/shorten)
You have to send a /post request with the body containing { url: (your url here) }. The API will return a JSON with both the longUrl (the one you sent) and the shortUrl (the one that was created).
This will throw an Error if the URL format is invalid.

## Use shortened urls (/:shortKey)
You just need to visit the shortUrl generated in the Shorten URL step, and you will be automatically redirected.

# Future Plans

## Tracking Short URL visits
Track how many times a specific short url was visited.
This is already being stored in the database, but a GET endpoint will be enabled to get such data.
