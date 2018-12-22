import { InternalServerError, BadRequestError } from 'restify-errors';
import IController from '../../../interfaces/utils/IController';
import { IRequest, IResponse } from '../../../interfaces/utils/IServer';
import { Next } from 'restify';
import to from 'await-to-js';
import * as Twilio from 'twilio';
import { twilio, config } from '../../../../config/env';

export default class EmailNotifier implements IController {
  public async post(req: IRequest, res: IResponse, next: Next) {
    try {
      const params = req.body;
      if (!params.to || !params.body) {
        return res.send(new BadRequestError('Incomplete parameters'));
      }
      const accountSid = twilio.sid;
      const authToken = twilio.token;
      const fromPhoneNumber = twilio.number;
      const client = Twilio(accountSid, authToken);

      const [err, success] = await to (client.messages.create({
        body: params.body,
        to: params.to,
        from: fromPhoneNumber
      }));

      if (err) {
        return { success: false, error: 'Could not send message' };
      } else {
        return { success: true };
      }
    } catch (e) {
      req.log.error(e);
      return res.send(new InternalServerError());
    }
  }
}
