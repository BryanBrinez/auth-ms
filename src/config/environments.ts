import * as joi from 'joi';
import 'dotenv/config';

interface EnvironmentsVariables {
  NATS_SERVER: string;
  JWT_SECRET: string;
}

const environmentsSchema = joi
  .object({
    NATS_SERVER: joi.string().required(),
    JWT_SECRET: joi.string().required(),
  })
  .unknown();

const { error, value } = environmentsSchema.validate({
  ...process.env,
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const environmentVariables: EnvironmentsVariables = value;

export const environments = {
  natsServer: environmentVariables.NATS_SERVER,
  jwtSecret: environmentVariables.JWT_SECRET,
};
