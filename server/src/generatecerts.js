const forge = require('node-forge');
const path = require('path')
const fs = require('fs')

function generateTLSCerts () {

  var pki = forge.pki;
  var keys = pki.rsa.generateKeyPair(2048);
  var cert = pki.createCertificate();
  const directoryPath = path.join(__dirname,'./../certs')
  
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

  //Read the subjectInfo information from 
  try {
      const subjectInfo = JSON.parse(fs.readFileSync(path.join(directoryPath, 'config.json')))

      const commonName = subjectInfo.CN ? subjectInfo.CN : ''
      const countryName = subjectInfo.C ? subjectInfo.C : ''
      const stateName = subjectInfo.ST ? subjectInfo.ST : ''
      const organizationName = subjectInfo.O ? subjectInfo.O : ''
      const localityName = subjectInfo.L ? subjectInfo.L : ''
      const orgUnit = subjectInfo.OU ? subjectInfo.OU : ''

      const attrs = [{
        name: 'commonName',
        value: commonName
      }, {
        name: 'countryName',
        value: countryName
      }, {
        shortName: 'ST',
        value: stateName
      }, {
        name: 'localityName',
        value: localityName
      }, {
        name: 'organizationName',
        value: organizationName
      }, {
        shortName: 'OU',
        value: orgUnit
      }];
     
      cert.setSubject(attrs);     
      cert.setIssuer(attrs);
      
      // self-sign certificate
      cert.sign(keys.privateKey);
      
      //convert key and cert to PEM and write to file
      var pem = pki.certificateToPem(cert);
      var key = pki.privateKeyToPem(keys.privateKey)
            
      fs.writeFileSync(path.join(directoryPath, 'cert.pem'), pem)
      fs.writeFileSync(path.join(directoryPath, 'cert.key'), key)
      
      console.log('TLS certificates have been generated with the following information', subjectInfo)
  } catch (e) {
    console.log('Error parsing certificate config file - config.json')
  }
}

module.exports = {
  generateTLSCerts
};
