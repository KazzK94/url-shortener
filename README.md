# URL Shortener

SMOL is a basic URL shortener which allows users to create shorter urls as well as track their traffic.
Users can create shorter urls using this API, and when someone visits the short URL they will be redirected to the original url automatically, while tracking the visit (no personal information such as the visitor's IP is stored in the database).

## Shorten URL (POST /shorten)

You have to send a POST request with the body containing an object like: `{ url: (your url here) }`.
The API will return a JSON with both the targetUrl (the one you sent) and the shortUrl (the one that was created).
This will throw an Error if the URL format is invalid.
Besides, if you are logged at that moment, you will be considered the owner of such URL.

## Use shortened urls (GET /:shortKey)

Anyone can visit the url with the generated `shortKey` to be redirected automatically, while having the visit tracked in our database. No need for any aditional configuration. If the `shortKey` is eventually changed, the older one will stop working.
If you need two `shortKey`s for the same URL, you will need to shorten it twice.

# Managing your URLs

## Get all your URLs' information (GET /data)

Get a list of URL Data objects with the information of all the URLs of the logged user.
You will be redirected to `/auth/unauthorized` if not logged in.

## Get the data of a specific URL (GET /data/:shortKey)

Get the data of only a specific URL, if it exists in the database.

## Rename the Short Key of a URL (PUT /:shortKey/rename)
If you created a URL, you can then change the `shortKey` at your will.
You need to send a PUT query with the body containing an object like: `{ shortKey: (your shortKey here) }` and the `shortKey` for that URL in the database will be replaced by the one that you send.
Take into account that the new `shortKey` will replace the old one, so only the new one will work from that moment.

## Disable the URL (PUT /:shortKey/disable)
You can temporarily disable a URL by sending a PUT to `:/shortKey/disable`. Every further request to the short URL will not work unless you enable it again. It will not be tracked either.

## Enable the URL (PUT /:shortKey/enable)
You can re-enable any disabled URL by sending a PUT to `/:shortKey/enable`. This will enable visits to this URL again.

## Delete the URL (DELETE /:shortKey)
You can delete any URL that you own, by sending a DELETE to `/:shortKey`. All information will be lost: the shortened URL will cease to exist and all the visit logs will be deleted as well.
> [!CAUTION]
> This action is IRREVERSIBLE.
