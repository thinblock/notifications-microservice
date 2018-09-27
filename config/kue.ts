import { createQueue, Job } from 'kue';
import { post } from 'superagent';
import { logger } from '../utils/logger';
import { publishMessage } from '../utils/helpers';
import { config } from './env';
import { oneLine } from 'common-tags';

const queue = createQueue({ redis: config.db });

queue.process('notifications-worker', function (job, done) {
  const jobData = job.data;
  processJob(jobData)
    .then(() => {
      logger.info(oneLine`
        [i] Job (${jobData._id}) with QueueId: ${job.id} finished successfully
      `);
      done();
    })
    .catch((e) => {
      logger.error(oneLine`
        [Err] Job (${jobData._id}) with QueueId: ${job.id} errored
      `, e);
      done(e);
    });
});

async function processJob(jobData: any) {
  const data = jobData.data;
  const token = jobData.token;
  const timestamp = jobData.timestamp;
  const event = jobData.event;
  const type: string = jobData.notification.type;
  // Type can be SMS, EMAIL and WEBHOOK
  // The notification resource will be according to the type. e.g if WEBHOOK than
  // it'll be a URL supporting POST.
  const notificationResource: string = jobData.notification.value;
  try {
    if (type === 'WEBHOOK') {
      logger.info(oneLine`
        [i] Trying to POST ${notificationResource} with EVENT: ${event}
        on Timestamp: ${timestamp} for Job: ${jobData._id}
      `);
      const res = await post(
        notificationResource + (token ? ('?token=' + token) : '')
      ).send({
        timestamp, event, data
      });
      logger.info(oneLine`
        [i] POSTED event: ${event} to ${notificationResource} was successfull
        for Job: ${jobData._id}
      `);
    }
  } catch (e) {
    logger.info(oneLine`
      [Err] Error occurred while publishing event: ${event} to Job: ${jobData._id}
    `, e);
    throw e;
  }

  return true;
}

export function enqueueJob(data: any) {
  return new Promise<Job>((resolve, reject) => {
    const job = queue.create('notifications-worker', data).save((err: Error) => {
      if (err) {
        return reject(err);
      }
      return resolve(job);
    });
  });
}

export default queue;