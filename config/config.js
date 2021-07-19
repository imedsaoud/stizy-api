const Joi = require('joi');

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require('dotenv').config({path:'.env'});
console.log(process.env.STATE);
if (process.env.STATE == "production") {
  console.log('Load prod config file')
  require('dotenv').config({ path: '.env_prod' });
} 
else if (process.env.STATE == "preprod" ){
  console.log('Load preprod config file')
  require('dotenv').config({ path: '.env_preprod' });
} else {
  console.log('Load dev config file')
  process.env.STATE = "dev"
  require('dotenv').config({ path: '.env_dev' });
}

// define validation for all the env vars
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .allow(['development', 'production', 'test', 'provision'])
    .default('development'),
    HTTPS: Joi.boolean()
    .default(false),    
    URI: Joi.string()
    .default('http://0.0.0.0'),       
  API_PORT: Joi.number()
    .default(4040),
    JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MONGOOSE_DEBUG: Joi.boolean()
    .when('NODE_ENV', {
      is: Joi.string().equal('development'),
      then: Joi.boolean().default(true),
      otherwise: Joi.boolean().default(false)
    }),
  MONGO_HOST: Joi.string().required()
    .description('Mongo DB host url')
}).unknown()
  .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  https:envVars.HTTPS,
  env: envVars.NODE_ENV,
  port: envVars.API_PORT,
  jwtSecret: envVars.JWT_SECRET,
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  mongo: {
    host: envVars.MONGO_HOST,
  }
};

module.exports = config;
