import { InternalServerError, BadRequestError } from 'restify-errors';
import IController from '../../../interfaces/utils/IController';
import { IRequest, IResponse } from '../../../interfaces/utils/IServer';
import { Next } from 'restify';
import { config } from '../../../../config/env';
const sgMail = require('@sendgrid/mail');

export default class EmailNotifier implements IController {
  public async post(req: IRequest, res: IResponse, next: Next) {
    try {
      const params = req.body;
      if (!params.to || !params.from || !params.subject || !params.text) {
        return res.send(new BadRequestError('Incomplete parameters'));
      }
      sgMail.setApiKey(config.sendgrid_key);
      const msg = {
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text,
        html: `<strong>${params.text}</strong>`,
      };
      sgMail.send(msg);

      return res.send({ success: true, message: 'Email send' });
    } catch (e) {
      req.log.error(e);
      return res.send(new InternalServerError());
    }
  }
}
