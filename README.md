# Cloudflare DNS Updater
This is a simple NodeJS script that allows you to Upsert a DNS record for all of your zones within a cloudflare account. 
**WARNING**: If the record exists, it will be deleted and recreated.

### Edit config
Add your settings to the `/src/config/local.json` file:

* **cloudflareToken**: This can be retrived from your cloudflare account under the "API Tokens" section,  your token will need permission to Edit zones. More information can be found at https://api.cloudflare.com/#getting-started-requests
* **skippedZones**: If you have a list of zones you'd like to prevent updating, this is where you list out the domain names.
* **dnsRecord**: This is where you define the DNS record you'd like to create.

### How to run

```
npm install
node .\index.js
```

### Projects used
* [cloudflare](https://github.com/cloudflare/node-cloudflare)
* [linq](https://github.com/mihaifm/linq)

### Additional references
* [Cloudflare API documentation](https://api.cloudflare.com/#getting-started-endpoints)