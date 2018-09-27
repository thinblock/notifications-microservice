import { InternalServerError, NotFoundError } from 'restify-errors';
import to from 'await-to-js';
import IController from '../../interfaces/utils/IController';
import { IRequest, IResponse } from '../../interfaces/utils/IServer';
import { validateAndConfirmMessage } from '../../../utils/helpers';
import { Next } from 'restify';
import { enqueueJob } from '../../../config/kue';
import { getJob } from '../../../utils/jobs_service';
import { ISNSEvent } from '../../interfaces/utils/IAWS';

export default class WebhooksListener implements IController {
  public async post(req: IRequest, res: IResponse, next: Next) {
    try {
      console.log(req.body);
      const notification: ISNSEvent = JSON.parse(req.body);
      const [er, result] = <[Error, string]> await to(validateAndConfirmMessage(notification));
      if (er || result !== 'success') {
        return res.send(er || result);
      }
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(notification.Message);
      } catch (e) {
        req.log.error('[Error] Error occurred while parsing SNS Message', e);
      }
      const jobId = parsedData.jobId;

      const [err, job] = await to(getJob(jobId));

      if (err) {
        req.log.error(err);
        return res.send(new NotFoundError('A Job associated with this id was not found!'));
      }

      const jobData = job;
      const enqueuedJob = await enqueueJob({
        timestamp: notification.Timestamp,
        notification: jobData.notification,
        data: parsedData.data,
        event: parsedData.event,
        _id: jobId
      });
      req.log.info('[i] Created job with ID: ', enqueuedJob.id);
      return res.send({ success: true, job_id: enqueuedJob.id });
    } catch (e) {
      req.log.error(e);
      return res.send(new InternalServerError());
    }
  }

}
