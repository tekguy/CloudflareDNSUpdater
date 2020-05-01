process.env['NODE_CONFIG_DIR'] = __dirname + '/config/';
var Enumerable  = require('linq');
var config = require('config');

let app = async() => {
  var cf = require('cloudflare')({
      token: config.get('cloudflareToken')
  });

  const dnsRecord = config.get('dnsRecord');
  const skipZones = config.get('skippedZones');


  let getZones = async () =>{
    return cf.zones.browse({page: 1, per_page: 100}).then(function (resp) {
      var rec = Enumerable.from(resp.result).select(function (x){ return {id: x.id, name: x.name}}).toArray();
      return rec;
    });
  }

  let checkZoneRecord = async (zoneId, zoneName, dnsRecord) =>{
    return cf.dnsRecords.browse(zoneId).then(function(resp){
      //console.log ('Checking if record name \'%s\' exists in zone \'%s\'', dnsRecord.name, zoneName);
      var rec = Enumerable.from(resp.result).where(function(x){return x.name == dnsRecord.name + '.' + zoneName}).select(function(i){return i.id}).toJoinedString();
      return rec;
    });
  }

  let createZoneRecord = async (zoneId, zoneName, dnsRecord) =>{
    // create zone
    console.log ('Attempting to create record \'%s\' for zone \'%s\'', dnsRecord.name, zoneName)
    return cf.dnsRecords.add(zoneId, dnsRecord).then(function(resp){
      if(resp.success && resp.result.id.length > 0){
        console.log('DNS record \'%s\' CREATED for \'%s\'', dnsRecord.name, zoneName)
        return true;
      }
    }).catch(err =>{ console.log(err)});
  }
  
  let deleteZoneRecord = async (zoneId, recordId) => {
    return cf.dnsRecords.del(zoneId, recordId).then(function(resp){
      if(resp.success){
        console.log('DNS record \'%s\' DELETED', recordId)
        return true;
      }
    });
  }

  // get zones
  let zones = await getZones();
  // loop over zones
  zones.forEach(async x =>{
      // does name exist in skipped array?
      var found = skipZones.find(y => y == x.name);

      if(found != undefined){
        console.log ('Found \'%s\' in list of domains to skip',x.name)
      }else{
        // // does record exist?
         let recordId = await checkZoneRecord(x.id, x.name, dnsRecord);
        if(recordId != ""){
          // record exists, delete record first and re-create it
          var successDelete = await deleteZoneRecord(x.id, recordId)
          if(successDelete)
          {
            // create record
            await createZoneRecord(x.id, x.name, dnsRecord)
          }
        }else{
          // create record 
          await createZoneRecord(x.id, x.name, dnsRecord)
        }
      }
  });
  
}

app().catch(err =>{console.log(err)});