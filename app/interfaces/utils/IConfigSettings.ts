interface EnvConfig {
  root: string;
  name: string;
  port: number;
  env: string;
  debug: boolean;
  db: string;
  test: boolean;
  aws_region: string;
  sendgrid_key: string;
}

interface TwilioConfig {
  sid: string;
  token: string;
  number: string;
}

export {
  EnvConfig,
  TwilioConfig
};