const addId = async function (schema,postObject,sortFilter) {
  const Schema = require('../models/'+schema+'.model');
  console.log("===start===")
  console.log(postObject)
  const queryOptions = {
    limit: 1,
    sort: { [sortFilter]: -1}
  };
  queryOptions.collation = {
    locale: "en_US",
    numericOrdering: true
};

  let lastInsertObject = await Schema.find({},{},queryOptions)
  if(lastInsertObject.length !== 0) {
    postObject[sortFilter] = ++lastInsertObject[0][sortFilter];
  } 
  else{
    postObject[sortFilter]  = 0;
  }
  console.log("===end===")
  console.log(postObject)
  return postObject 
};

module.exports = addId;



