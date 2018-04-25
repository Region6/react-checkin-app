export default (data, separator) => {
  let retVal;
  if ( /^@/.test(data) === true ) {
  retVal = pdf417(data, separator);
  } else if ( /^%/.test(data) === true  ) {
  // retVal = stripe(data);
  } else {
  console.log('couldnt identify format');
  }
  return retVal;
};

const getPdf417Parsed = (data, separator) => {
  let name;

  if(!separator) {
    separator = '\n';
  }

  // get version of aamva (before 2000 or after)
  const versionMatch = data.match(/(ANSI |AAMVA)\d{6}(\d{2})/);
  /* version 01 year 2000 */
  if(!versionMatch) {
    console.log('unable to get version');
    return;
  }

  let parsedData = {};

  const version = Number(versionMatch[2]);
  parsedData.version = version;

  let parseRegex;
  const fields = [
    'DAA',
    'DAB',
    'DAC',
    'DAD',
    'DAE',
    'DAF',
    'DAG',
    'DAH',
    'DAI',
    'DAJ',
    'DAK',
    'DAL',
    'DAM',
    'DAN',
    'DAO',
    'DAP',
    'DAQ',
    'DAR',
    'DAS',
    'DAT',
    'DAU',
    'DAV',
    'DAW',
    'DAX',
    'DAY',
    'DAZ',
    'DBA',
    'DBB',
    'DBC',
    'DBD',
    'DBE',
    'DBF',
    'DBG',
    'DBH',
    'DBI',
    'DBJ',
    'DBK',
    'DBL',
    'DBM',
    'DBN',
    'DBO',
    'DBP',
    'DBQ',
    'DBR',
    'DBS',
    'DCA',
    'DCB',
    'DCD',
    'DCE',
    'DCF',
    'DCG',
    'DCH',
    'DCI',
    'DCJ',
    'DCK',
    'DCL',
    'DCM',
    'DCN',
    'DCO',
    'DCP',
    'DCQ',
    'DCR',
    'DCS',
    'DCT',
    'DCU',
    'DDA',
    'DDB',
    'DDC',
    'DDD',
    'DDE',
    'DDF',
    'DDG',
    'DDH',
    'DDI',
    'DDJ',
    'DDK',
    'DDL',
    'PAA',
    'PAB',
    'PAC',
    'PAD',
    'PAE',
    'PAF'
  ];

  fields.forEach(field => {
    const regex = new RegExp(field + '[^' + separator + ']+' + separator);
    const match = regex.exec(data);

    //Default string to prevent errors i.e. Minnesota lacks DAK
    parsedData[field] = "";
    if (match){
      if (match[0].slice(3, match[0].length)) {
        parsedData[field] = match[0].slice(3, match[0].length - 1).trim();
      }
    }
  });

  // version 3 putting middle and first names in the same field
  if (parsedData.hasOwnProperty('DCT')) {
    if (parsedData.DCT.includes(',')) {
      name = parsedData.DCT.split(',');
    } else {
      name = parsedData.DCT.split(' ');
    }
    parsedData.DAC = name[0]; // first name
    parsedData.DAD = name[1] ? name[1] : '' ; // middle name
  }

  if (parsedData.hasOwnProperty('DAQ')) {
    parsedData.DAQ = parsedData.DAQ.replace(/ /g, '');
    parsedData.DAQ = parsedData.DAQ.replace(/-/g, '');
  }

  if (parsedData.hasOwnProperty('DAA') && parsedData.DAA.length) {
    name = parsedData.DAA.split(',');

    // PA License seperated by space
    if (name.length <= 1) {
      name = parsedData.DAA.split(' ');
      parsedData.DCS = name[2];
      parsedData.DAC = name[0];
      parsedData.DAD = name[1];
    } else {
      parsedData.DCS = name[0];
      parsedData.DAC = name[1];
      parsedData.DAD = name[2];
    }
  }

  if (parsedData.hasOwnProperty('DAR')) {
    parsedData.DCA = parsedData.DAR;
  }

  if (Number(version) === 1 && parsedData.hasOwnProperty('DBB')) {
    // date on 01 is CCYYMMDD while on 07 MMDDCCYY
    parsedData.DBB = (
      parsedData.DBB.substring(4,6) +  // month
        parsedData.DBB.substring(6,8) +  // day
        parsedData.DBB.substring(0,4)    // year
    );
  }

  if (Number(version) === 1 && parsedData.hasOwnProperty('DAL')) {
    // Oregon is different.
    parsedData.DAG = parsedData.DAG || parsedData.DAL;
  }

  return parsedData;
}

const pdf417 = (data, separator) => {
  const parsedData = getPdf417Parsed(data, separator);
  const rawData = {
    state: parsedData.DAJ,
    city: parsedData.DAI,
    name: function() {
      return {
        last: parsedData.DCS,
        first: parsedData.DAC,
        middle: parsedData.DAD
      };
    },
    address: parsedData.DAG,
    iso_iin: undefined,
    dl: parsedData.DAQ.replace(' ', ''), // Because Michigican puts spaces in their license numbers. Why...
    expiration_date: () => {
      const exp = parsedData.DBA.match(/(\d{4})(\d{2})(\d{2})/);
      let date;
      if(exp[1].startsWith('20')){
        //Year is first
        exp[1] = parseInt(exp[1]);
        exp[2] = parseInt(exp[2]);
        exp[3] = parseInt(exp[3]);
        date = new Date(Date.UTC(exp[1], (exp[2]-1), (exp[3]+1))).setHours(15,0,0,0);
      }else{
        exp = parsedData.DBA.match(/(\d{2})(\d{2})(\d{4})/);
        exp[1] = parseInt(exp[1]);
        exp[2] = parseInt(exp[2]);
        exp[3] = parseInt(exp[3]);
        date = new Date(Date.UTC(exp[3], (exp[1]-1), (exp[2]+1))).setHours(15,0,0,0);
      }

      return date;
    },
    birthday: function() {
      let dob = parsedData.DBB.match(/(\d{2})(\d{2})(\d{4})/);
      dob[1] = parseInt(dob[1]);
      dob[2] = parseInt(dob[2]);
      dob[3] = parseInt(dob[3]);

      // return ( new Date( Date.UTC(dob[3], dob[1], dob[2]) ) );
      return new Date(Date.UTC(dob[3], (dob[1]-1), (dob[2]+1))).setHours(15,0,0,0);
    },
    dob: parsedData.DBB,
    dl_overflow: undefined,
    cds_version: undefined,
    aamva_version: parsedData.version,
    jurisdiction_version: undefined,
    postal_code: parsedData.DAK.match(/\d{-}\d+/)? parsedData.DAK : parsedData.DAK.substring(0,5),
    class: parsedData.DCA,
    restrictions: undefined,
    endorsments: undefined,
    sex: function() {
      switch(parsedData.DBC) {
        case "1":
        case 'M':
          return "MALE";
        case "2":
        case 'F':
          return "FEMALE";
        default:
          return "UKNOWN";
      }
    },
    height: undefined,
    weight: undefined,
    hair_color: undefined,
    eye_color: undefined,
    misc: undefined,
    id: function(){
      return parsedData.DAQ.replace(/[^A-ZA-Z0-9]/g, "");
    }
  };

  return rawData;
};
