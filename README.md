
# URL Shortener
This is a url shortener. You can create shorter urls using this api, and when you visit the short url you'll be redirected to the long url automatically.

## Shorten URL (/shorten)
You have to send a /post request with the body containing { url: (your url here) }. The API will return a JSON with both the longUrl (the one you sent) and the shortUrl (the one that was created).

## Use shortened urls (/:shortKey)
You just need to visit the shortUrl generated in the Shorten URL step, and you will be automatically redirected.

# Future Plans

## Authentication
In the future this API will require authentication.

## API Key
The app will give an API Key so any user can use the shortener in their site.

## Tracking Short URL visits
Track how many times a specific short url was visited.

## Validate URL
Make sure the introduced URL is a valid URL.